import type {
  TreeCollection,
  TreeNode,
  TreeViewLoadChildrenCompleteDetails,
  TreeViewLoadChildrenDetails,
  TreeViewLoadChildrenErrorDetails,
} from "@ark-ui/react/tree-view";
import { useTreeView } from "@ark-ui/react/tree-view";
import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";
import type { TreeViewVariant } from "#styled-system/recipes";

import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";
import { SelectionSearchField, getSelectAllState, normalizeQuery } from "../Listbox/managed";
import type { SelectionSearchOptions } from "../Listbox/types";
import { VirtualScrollArea } from "../ScrollArea";
import {
  type TreeCanDropDetails,
  TreeViewDndProvider,
  type TreeViewDndProviderProps,
} from "./dnd/TreeDndContext";
import { collectCheckableBranches, filterTreeCollection } from "./treeCollectionUtils";
import { TreeDndRow, TreeNodeLabel, type TreeNodeRenderDetails } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import { TreeView } from "./TreeView";
import { useTreeLazyLoad } from "./useTreeLazyLoad";
import { useTreeSearchExpansion } from "./useTreeSearchExpansion";

type TreeSize = NonNullable<TreeViewVariant["size"]>;

// Must match the recipe's row padding-y + line-height per size.
const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};

const SELECT_ALL_BUTTON_SIZE: Record<TreeSize, TooltipIconButtonProps["size"]> = {
  sm: "xs",
  md: "sm",
};

type TreeSelectListDndProps<TNode extends TreeNode> = Pick<
  TreeViewDndProviderProps<TNode>,
  | "isNodeDraggable"
  | "blockReparent"
  | "autoExpandDelay"
  | "onDrop"
  | "onDragStart"
  | "onDragEnd"
  | "canDrop"
  | "getDragValues"
  | "getExtraDragData"
  | "renderDragPreview"
  | "getDropAnnouncement"
  | "autoScrollSpeed"
>;

interface TreeSelectListBaseProps<TNode extends TreeNode> extends TreeSelectListDndProps<TNode> {
  /** The tree collection. Create with `createTreeCollection()`. */
  collection: TreeCollection<TNode>;
  /** Controlled selected leaf-node IDs. */
  value: string[];
  /** Callback when selected values change. */
  onValueChange: (value: string[]) => void;
  /** Render custom node content. Defaults to the node label. */
  renderNode?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /** Render actions aligned to the end of a row. */
  renderActions?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /**
   * Determine whether a node should show a checkbox. Select-all skips leaves it rejects. Defaults
   * to true for all nodes.
   */
  isNodeCheckable?: (details: TreeNodeRenderDetails<TNode>) => boolean;
  /**
   * Search configuration. The input shows unless `showInput` is `false`, with the placeholder
   * "Search..." by default.
   */
  search?: SelectionSearchOptions<TNode>;
  /**
   * Expand every branch that has children while a query is active. Collapsing a branch during a
   * search lasts until the query changes and does not call `onExpandedChange`. @default true
   */
  expandOnSearch?: boolean;
  /** Show the select-all toggle button. @default true */
  showSelectAll?: boolean;
  /** Label of the select-all toggle while not everything is selected. @default "Select all" */
  selectAllLabel?: string;
  /** Label of the select-all toggle while everything is selected. @default "Deselect all" */
  clearAllLabel?: string;
  /** Controlled expanded node IDs. */
  expandedValue?: string[];
  /** Initial expanded node IDs (uncontrolled). Defaults to all branches that have children. */
  defaultExpandedValue?: string[];
  /** Callback when expanded nodes change. */
  onExpandedChange?: (expandedValue: string[]) => void;
  /**
   * Height of the scroll area: px if a number, otherwise a size token or CSS length.
   * @default "320px"
   */
  listHeight?: string | number;
  /** Size variant. @default "md" */
  size?: TreeSize;
  /**
   * Enables drag-and-drop reordering. Called with the reordered collection after a drop.
   * DnD is automatically disabled while a search query is active.
   */
  onCollectionChange?: (collection: TreeCollection<TNode>) => void;
}

type TreeSelectListLoadProps<TNode extends TreeNode> =
  | { loadChildren?: never; onLoadChildrenComplete?: never; onLoadChildrenError?: never }
  | {
      /**
       * Loads a branch's children when it is expanded. A node needs loading while it has
       * `childrenCount` set, no `children` in `collection` and no finished load; a `collection` not
       * returned by `onLoadChildrenComplete` starts afresh. The branch stays collapsed until the
       * load finishes, then opens even if it came back empty.
       */
      loadChildren: (details: TreeViewLoadChildrenDetails<TNode>) => Promise<TNode[]>;
      /** Receives `collection` with the loaded `children` merged in; pass it back as `collection`. */
      onLoadChildrenComplete: (details: TreeViewLoadChildrenCompleteDetails<TNode>) => void;
      /** Called when `loadChildren` rejects; the branch stays collapsed and retries on next expand. */
      onLoadChildrenError?: (details: TreeViewLoadChildrenErrorDetails<TNode>) => void;
    };

export type TreeSelectListProps<TNode extends TreeNode> = TreeSelectListBaseProps<TNode> &
  TreeSelectListLoadProps<TNode>;

const TreeIndicatorSpacer = () => (
  <Box
    aria-hidden="true"
    data-tree-indicator-spacer="true"
    flexShrink={0}
    boxSize="var(--tree-icon-size)"
  />
);

interface TreeRowProps {
  isBranch: boolean;
  expanded: boolean;
  loading: boolean;
  checkable: boolean;
  indexPath: number[];
  children: ReactNode;
  actions: ReactNode | undefined;
  onPointerDown: (e: React.PointerEvent) => void;
  onToggleChecked: () => void;
}

// Virtualized rows render flat, so Ark can't derive --depth from nesting.
const depthStyleFor = (indexPath: number[]): React.CSSProperties & { "--depth": number } => ({
  "--depth": indexPath.length,
});

const TreeSelectRow = ({
  isBranch,
  expanded,
  loading,
  checkable,
  indexPath,
  children,
  actions,
  onPointerDown,
  onToggleChecked,
}: TreeRowProps) => (
  <TreeDndRow
    isBranch={isBranch}
    loading={loading}
    role={isBranch ? "treeitem" : undefined}
    aria-expanded={isBranch ? expanded : undefined}
    aria-level={isBranch ? indexPath.length : undefined}
    onPointerDown={onPointerDown}
    onKeyDown={(e) => {
      if (!checkable || e.target !== e.currentTarget) return;
      if (e.key === " " || (e.key === "Enter" && !isBranch)) {
        e.preventDefault();
        onToggleChecked();
      }
    }}
    style={depthStyleFor(indexPath)}
  >
    <TreeRowIndentGuides indexPath={indexPath} />
    {isBranch ? <TreeView.BranchIndicator /> : <TreeIndicatorSpacer />}
    {checkable && (
      <TreeView.NodeCheckbox
        onClick={(e) => {
          // Bails out zag's own toggle, which would also check unselectable leaves.
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.closest<HTMLElement>("[role=treeitem]")?.focus({ preventScroll: true });
          onToggleChecked();
        }}
      />
    )}
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
        onKeyDown={(e) => e.stopPropagation()}
      >
        {actions}
      </Box>
    )}
  </TreeDndRow>
);

export const TreeSelectList = <TNode extends TreeNode>({
  collection,
  value,
  onValueChange,
  renderNode,
  renderActions,
  isNodeCheckable,
  search,
  showSelectAll = true,
  selectAllLabel = "Select all",
  clearAllLabel = "Deselect all",
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  listHeight = "320px",
  size = "md",
  onCollectionChange,
  canDrop,
  expandOnSearch = true,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  ...dndProps
}: TreeSelectListProps<TNode>) => {
  const [internalQuery, setInternalQuery] = useState(search?.defaultQuery ?? "");
  const resolvedQuery = search?.query ?? internalQuery;
  const normalizedQuery = normalizeQuery(resolvedQuery);
  const queryActive = normalizedQuery !== "";
  const externalSearch = search?.mode === "external";
  const searchFilter = search?.filter;

  const setQuery = (nextQuery: string) => {
    if (search?.query === undefined) setInternalQuery(nextQuery);
    search?.onQueryChange?.(nextQuery);
  };

  // --- Filtering ---

  const displayedCollection = useMemo(
    () => filterTreeCollection(collection, externalSearch ? "" : normalizedQuery, searchFilter),
    [collection, externalSearch, normalizedQuery, searchFilter],
  );

  // --- Expansion state ---

  const lazyLoad = useTreeLazyLoad({
    collection,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
    abortKey: externalSearch ? normalizedQuery : "",
  });

  const expansion = useTreeSearchExpansion({
    collection,
    displayedCollection,
    expandedValue,
    defaultExpandedValue,
    onExpandedChange,
    normalizedQuery,
    expandOnSearch,
    loadedValues: lazyLoad.loadedValues,
  });

  const handleExpandedChange = (nextExpandedValue: string[]) => {
    const deferredValues = expansion.getOpenedValues(nextExpandedValue).filter(lazyLoad.needsLoad);
    lazyLoad.start(deferredValues, expansion.expand);
    expansion.setExpandedValue(
      nextExpandedValue.filter((treeValue) => !deferredValues.includes(treeValue)),
    );
  };

  // Filtering keeps a matching branch with no children, which then reads as a leaf.
  const leafValueSet = useMemo(() => new Set(collection.getDescendantValues([])), [collection]);

  const isLeafCheckable = useCallback(
    (node: TNode, indexPath: number[]) =>
      leafValueSet.has(displayedCollection.getNodeValue(node)) &&
      (isNodeCheckable?.({ node, indexPath, isBranch: false }) ?? true),
    [displayedCollection, isNodeCheckable, leafValueSet],
  );

  const selectableLeafValues = useMemo(() => {
    const values: string[] = [];
    displayedCollection.visit({
      onEnter: (node, indexPath) => {
        if (
          !displayedCollection.isBranchNode(node) &&
          !displayedCollection.getNodeDisabled(node) &&
          isLeafCheckable(node, indexPath)
        ) {
          values.push(displayedCollection.getNodeValue(node));
        }
      },
    });
    return values;
  }, [displayedCollection, isLeafCheckable]);

  const selectableLeafSet = useMemo(() => new Set(selectableLeafValues), [selectableLeafValues]);

  const checkableBranches = useMemo(
    () => collectCheckableBranches(displayedCollection, leafValueSet, selectableLeafSet),
    [displayedCollection, leafValueSet, selectableLeafSet],
  );

  const resolvedIsNodeCheckable = ({ node, indexPath, isBranch }: TreeNodeRenderDetails<TNode>) => {
    if (!isBranch) return isLeafCheckable(node, indexPath);
    if (!checkableBranches.has(displayedCollection.getNodeValue(node))) return false;
    return isNodeCheckable?.({ node, indexPath, isBranch }) ?? true;
  };

  const selectAll = useMemo(
    () => getSelectAllState(value, selectableLeafValues),
    [selectableLeafValues, value],
  );

  const toggleChecked = (node: TNode, isBranch: boolean) => {
    if (displayedCollection.getNodeDisabled(node)) return;
    const nodeValue = displayedCollection.getNodeValue(node);
    const leafValues = isBranch ? displayedCollection.getDescendantValues(nodeValue) : [nodeValue];
    const selectable = leafValues.filter((leafValue) => selectableLeafSet.has(leafValue));
    if (selectable.length) onValueChange(getSelectAllState(value, selectable).toggle());
  };

  const handleCheckedChange = (checkedValue: string[]) => {
    const nextSet = new Set(checkedValue);
    const valueSet = new Set(value);
    onValueChange([
      ...value.filter((entry) => nextSet.has(entry) || !selectableLeafSet.has(entry)),
      ...checkedValue.filter((entry) => !valueSet.has(entry) && selectableLeafSet.has(entry)),
    ]);
  };

  // --- Tree view hook ---

  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const tree = useTreeView({
    collection: displayedCollection,
    checkedValue: value,
    onCheckedChange: (details) => handleCheckedChange(details.checkedValue),
    expandedValue: expansion.visibleExpandedValue,
    onExpandedChange: (details) => handleExpandedChange(details.expandedValue),
    onFocusChange: (details) => setFocusedValue(details.focusedValue),
    scrollToIndexFn: (details) => scrollToIndexRef.current?.(details.index),
    selectedValue: [],
    onSelectionChange: () => {}, // No selection management (focus only) since it interferes with checkbox interactions
  });

  const visibleNodes = tree.getVisibleNodes();
  // With nothing focused yet, the tree's tab stop is its first row.
  const focusedIndex =
    focusedValue === null
      ? 0
      : visibleNodes.findIndex(
          ({ node }) => displayedCollection.getNodeValue(node) === focusedValue,
        );

  // --- Drag and drop ---
  // Disabled during a query so rendered indexPaths match the source collection DnD mutates.
  const dndActive = onCollectionChange != null && !queryActive;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);

  const resolvedCanDrop = (details: TreeCanDropDetails) => {
    if (details.instruction.type === "make-child" && lazyLoad.needsLoad(details.targetValue)) {
      return false;
    }
    return canDrop?.(details) ?? true;
  };

  const handleCollectionChange = (nextCollection: TreeCollection<TNode>) => {
    lazyLoad.carry(collection, nextCollection);
    onCollectionChange?.(nextCollection);
  };

  // --- Render ---

  const selectAllButton = showSelectAll && (
    <TooltipIconButton
      label={selectAll.allSelected ? clearAllLabel : selectAllLabel}
      size={SELECT_ALL_BUTTON_SIZE[size]}
      variant="plain"
      color="fg.muted"
      mr="1"
      flexShrink={0}
      onClick={() => onValueChange(selectAll.toggle())}
    >
      {selectAll.allSelected ? (
        <SquareCheckIcon />
      ) : selectAll.someSelected ? (
        <SquareMinusIcon />
      ) : (
        <SquareIcon />
      )}
    </TooltipIconButton>
  );

  const treeBody = (
    <TreeView.Tree>
      <VirtualScrollArea
        items={visibleNodes}
        itemHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
        getItemKey={(index) => displayedCollection.getNodeValue(visibleNodes[index].node)}
        height={listHeight}
        maxHeight={listHeight}
        viewportRef={setScrollViewport}
        scrollToIndexRef={scrollToIndexRef}
        keepMountedIndex={focusedIndex >= 0 ? focusedIndex : undefined}
        scrollbars="vertical"
        measure
        p="2"
      >
        {({ node, indexPath }) => {
          const nodeState = tree.getNodeState({ node, indexPath });
          const nodeValue = displayedCollection.getNodeValue(node);
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
              <TreeSelectRow
                isBranch={isBranch}
                expanded={nodeState.expanded}
                loading={lazyLoad.loadingValues.has(nodeValue)}
                checkable={checkable}
                indexPath={indexPath}
                actions={renderedActions}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  tree.focus(nodeValue);
                }}
                onToggleChecked={() => toggleChecked(node, isBranch)}
              >
                {renderedNode ?? (
                  <TreeNodeLabel isBranch={isBranch}>
                    {displayedCollection.stringifyNode(node)}
                  </TreeNodeLabel>
                )}
              </TreeSelectRow>
            </TreeView.NodeProvider>
          );
        }}
      </VirtualScrollArea>
    </TreeView.Tree>
  );

  return (
    <Flex direction="column">
      {search?.showInput !== false ? (
        <Box mb="2">
          <SelectionSearchField
            query={resolvedQuery}
            onQueryChange={setQuery}
            placeholder={search?.placeholder ?? "Search..."}
            autoFocus={search?.autoFocus}
            endElement={
              <>
                {search?.endElement}
                {selectAllButton}
              </>
            }
          />
        </Box>
      ) : (
        selectAllButton && (
          <Flex
            borderBottomWidth="1px"
            borderColor="border"
            align="center"
            mb="2"
          >
            {selectAllButton}
          </Flex>
        )
      )}
      <TreeView.RootProvider
        value={tree as ReturnType<typeof useTreeView>}
        size={size}
      >
        {onCollectionChange ? (
          // Keep the provider mounted: toggling `enabled` must not remount the tree.
          <TreeViewDndProvider
            {...dndProps}
            onCollectionChange={handleCollectionChange}
            canDrop={resolvedCanDrop}
            enabled={dndActive}
            scrollElement={scrollViewport}
          >
            {treeBody}
          </TreeViewDndProvider>
        ) : (
          treeBody
        )}
      </TreeView.RootProvider>
    </Flex>
  );
};
