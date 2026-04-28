import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { useTreeView } from "@ark-ui/react/tree-view";
import { Box, Flex } from "@construkt-kit/styled-system/jsx";
import { CheckIcon, MinusIcon, SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { IconButton } from "../Buttons";
import { SearchInput } from "../Input/SearchInput";
import { VirtualScrollArea } from "../ScrollArea/VirtualScrollArea";
import { Tooltip } from "../Tooltip";
import {
  collectBranchValues,
  collectBranchesWithLeafDescendants,
  collectLeafValues,
  filterTreeCollection,
  mergeFilteredValue,
} from "./treeCollectionUtils";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import { DEFAULT_TREE_SIZE, TREE_ROW_HEIGHT_ESTIMATE, type TreeSize } from "./treeShared";
import { TreeView } from "./TreeView";

export interface TreeSelectListProps<TNode extends TreeNode> {
  /** The tree collection. Create with `createTreeCollection()`. */
  collection: TreeCollection<TNode>;
  /** Controlled selected leaf-node IDs. */
  value: string[];
  /** Callback when selected values change. */
  onValueChange: (value: string[]) => void;
  /** Render custom node content. Defaults to the node label. */
  renderNode?: (details: { node: TNode; indexPath: number[]; isBranch: boolean }) => ReactNode;
  /** Render actions aligned to the end of a row. */
  renderActions?: (details: { node: TNode; indexPath: number[]; isBranch: boolean }) => ReactNode;
  /** Determine whether a node should show a checkbox. Defaults to true for all nodes. */
  isNodeCheckable?: (details: { node: TNode; indexPath: number[]; isBranch: boolean }) => boolean;
  /** Placeholder text for the search input. @default "Search..." */
  searchPlaceholder?: string;
  /** Custom search predicate. Receives the node and the lowercased query. */
  searchPredicate?: (node: TNode, query: string) => boolean;
  /** Show the search input. @default true */
  showSearch?: boolean;
  /** Show the select-all toggle button. @default true */
  showSelectAll?: boolean;
  /** Controlled expanded node IDs. */
  expandedValue?: string[];
  /** Initial expanded node IDs (uncontrolled). Defaults to all branches. */
  defaultExpandedValue?: string[];
  /** Callback when expanded nodes change. */
  onExpandedChange?: (expandedValue: string[]) => void;
  /** Max height for the scroll area. @default "320px" */
  maxHeight?: string;
  /** Size variant. @default "md" */
  size?: TreeSize;
}

const TreeNodeCheckbox = () => (
  <TreeView.NodeCheckbox>
    <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
      <CheckIcon />
    </TreeView.NodeCheckboxIndicator>
  </TreeView.NodeCheckbox>
);

const TreeIndicatorSpacer = () => (
  <Box
    aria-hidden="true"
    data-tree-indicator-spacer="true"
    flexShrink={0}
    boxSize="var(--tree-icon-size)"
  />
);

const TreeRow = ({
  isBranch,
  checkable,
  indexPath,
  children,
  actions,
  onPointerDown,
}: {
  isBranch: boolean;
  checkable: boolean;
  indexPath: number[];
  children: ReactNode;
  actions: ReactNode | undefined;
  onPointerDown: (e: React.PointerEvent) => void;
}) => {
  // In virtualized mode nodes render flat (no Branch wrapper), so Ark UI
  // cannot set --depth via DOM nesting. Set it explicitly from indexPath.
  const depthStyle = { "--depth": indexPath.length } as React.CSSProperties;

  const content = (
    <>
      <TreeRowIndentGuides indexPath={indexPath} />
      {isBranch ? <TreeView.BranchIndicator /> : <TreeIndicatorSpacer />}
      {checkable && <TreeNodeCheckbox />}
      <Box
        flex="1"
        minWidth="0"
      >
        {children}
      </Box>
      {actions && (
        <Box
          flexShrink={0}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </Box>
      )}
    </>
  );

  return isBranch ? (
    <TreeView.BranchControl
      onPointerDown={onPointerDown}
      style={depthStyle}
    >
      {content}
    </TreeView.BranchControl>
  ) : (
    <TreeView.Item
      onPointerDown={onPointerDown}
      style={depthStyle}
    >
      {content}
    </TreeView.Item>
  );
};

export const TreeSelectList = <TNode extends TreeNode>({
  collection,
  value,
  onValueChange,
  renderNode,
  renderActions,
  isNodeCheckable,
  searchPlaceholder = "Search...",
  searchPredicate,
  showSearch = true,
  showSelectAll = true,
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  maxHeight = "320px",
  size = DEFAULT_TREE_SIZE,
}: TreeSelectListProps<TNode>) => {
  const [search, setSearch] = useState("");
  const selectAllButtonSize = size === "sm" ? "xs" : "sm";

  // --- Filtering ---

  const filteredCollection = useMemo(
    () => filterTreeCollection(collection, search, searchPredicate),
    [collection, search, searchPredicate],
  );

  const rootNodes = useMemo(
    () => filteredCollection.getNodeChildren(filteredCollection.rootNode),
    [filteredCollection],
  );

  const allRootNodes = useMemo(() => collection.getNodeChildren(collection.rootNode), [collection]);

  // --- Checked / value management ---

  const handleCheckedChange = (checkedValue: string[]) => {
    onValueChange(
      mergeFilteredValue({
        collection: filteredCollection,
        value,
        visibleNodes: rootNodes,
        checkedTreeValues: checkedValue,
      }),
    );
  };

  // --- Expansion state ---

  const allExpandedValue = useMemo(
    () => collectBranchValues(collection, allRootNodes),
    [allRootNodes, collection],
  );

  const [uncontrolledExpandedValue, setUncontrolledExpandedValue] = useState<string[]>(
    defaultExpandedValue ?? allExpandedValue,
  );

  const resolvedExpandedValue = expandedValue ?? uncontrolledExpandedValue;

  const filteredExpandableValueSet = useMemo(
    () => new Set(collectBranchValues(filteredCollection, rootNodes)),
    [filteredCollection, rootNodes],
  );

  const visibleExpandedValue = useMemo(
    () => resolvedExpandedValue.filter((treeValue) => filteredExpandableValueSet.has(treeValue)),
    [filteredExpandableValueSet, resolvedExpandedValue],
  );

  const handleExpandedChange = (nextVisibleExpandedValue: string[]) => {
    const preservedExpandedValue = resolvedExpandedValue.filter(
      (treeValue) => !filteredExpandableValueSet.has(treeValue),
    );
    const nextExpandedValue = [...preservedExpandedValue, ...nextVisibleExpandedValue];

    if (expandedValue === undefined) {
      setUncontrolledExpandedValue(nextExpandedValue);
    }

    onExpandedChange?.(nextExpandedValue);
  };

  // --- Select all ---

  const allSelectableValues = useMemo(
    () => collectLeafValues(collection, allRootNodes),
    [allRootNodes, collection],
  );

  const selectedSet = useMemo(() => new Set(value), [value]);

  const allSelected =
    allSelectableValues.length > 0 &&
    allSelectableValues.every((selectionValue) => selectedSet.has(selectionValue));
  const someSelected =
    !allSelected && allSelectableValues.some((selectionValue) => selectedSet.has(selectionValue));

  // --- Checkability ---

  const selectableSubtrees = useMemo(
    () => collectBranchesWithLeafDescendants(filteredCollection, rootNodes),
    [filteredCollection, rootNodes],
  );

  const resolvedIsNodeCheckable = ({
    node,
    indexPath,
    isBranch,
  }: {
    node: TNode;
    indexPath: number[];
    isBranch: boolean;
  }) => {
    if (isBranch && !selectableSubtrees.has(filteredCollection.getNodeValue(node))) {
      return false;
    }
    return isNodeCheckable?.({ node, indexPath, isBranch }) ?? true;
  };

  // --- Tree view hook ---

  const tree = useTreeView({
    collection: filteredCollection,
    checkedValue: value,
    onCheckedChange: (details) => handleCheckedChange(details.checkedValue),
    expandedValue: visibleExpandedValue,
    onExpandedChange: (details) => handleExpandedChange(details.expandedValue),
    selectedValue: [],
    onSelectionChange: () => {}, // No selection management (focus only) since it interferes with checkbox interactions
  });

  const visibleNodes = tree.getVisibleNodes();

  // --- Render ---

  const showToolbar = showSearch || showSelectAll;

  return (
    <Flex direction="column">
      {showToolbar && (
        <Flex
          borderBottomWidth="1px"
          borderColor="border"
          align="center"
          mb="2"
        >
          {showSearch && (
            <Box
              flex="1"
              px="2"
            >
              <SearchInput
                size="sm"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
                variant="plain"
              />
            </Box>
          )}
          {showSelectAll && (
            <Tooltip content={allSelected ? "Deselect all" : "Select all"}>
              <IconButton
                aria-label={allSelected ? "Deselect all" : "Select all"}
                size={selectAllButtonSize}
                variant="plain"
                color="fg.muted"
                mr="1"
                flexShrink={0}
                onClick={() => onValueChange(allSelected ? [] : allSelectableValues)}
              >
                {allSelected ? (
                  <SquareCheckIcon />
                ) : someSelected ? (
                  <SquareMinusIcon />
                ) : (
                  <SquareIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      )}
      <TreeView.RootProvider
        value={tree as ReturnType<typeof useTreeView>}
        size={size}
      >
        <TreeView.Tree>
          <VirtualScrollArea
            items={visibleNodes}
            itemHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
            getItemKey={(index) => filteredCollection.getNodeValue(visibleNodes[index].node)}
            height={maxHeight}
            maxHeight={maxHeight}
            measure
            p="2"
          >
            {({ node, indexPath }) => {
              const nodeState = tree.getNodeState({ node, indexPath });
              const nodeValue = filteredCollection.getNodeValue(node);
              const isBranch = nodeState.isBranch;
              const checkable = resolvedIsNodeCheckable({ node, indexPath, isBranch });
              const renderedNode = renderNode?.({ node, indexPath, isBranch });
              const renderedActions = renderActions?.({ node, indexPath, isBranch });

              return (
                <TreeView.NodeProvider
                  key={nodeValue}
                  node={node}
                  indexPath={indexPath}
                >
                  <TreeRow
                    isBranch={isBranch}
                    checkable={checkable}
                    indexPath={indexPath}
                    actions={renderedActions}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      tree.focus(nodeValue);
                    }}
                  >
                    {renderedNode ??
                      (isBranch ? (
                        <TreeView.BranchText>
                          {filteredCollection.stringifyNode(node)}
                        </TreeView.BranchText>
                      ) : (
                        <TreeView.ItemText>
                          {filteredCollection.stringifyNode(node)}
                        </TreeView.ItemText>
                      ))}
                  </TreeRow>
                </TreeView.NodeProvider>
              );
            }}
          </VirtualScrollArea>
        </TreeView.Tree>
      </TreeView.RootProvider>
    </Flex>
  );
};
