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
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { TreeDropIndicator } from "./dnd/TreeDropIndicator";
import { useTreeNodeDnd } from "./dnd/useTreeNodeDnd";
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
  /**
   * Enables drag-and-drop reordering. Called with the reordered collection after a drop.
   * DnD is automatically disabled while a search filter is active.
   */
  onCollectionChange?: (collection: TreeCollection<TNode>) => void;
  /** Whether a node may be dragged (DnD only). @default all nodes */
  isNodeDraggable?: (node: TNode) => boolean;
  /** Disable outdent (reparent) drops (DnD only). @default false */
  blockReparent?: boolean;
  /**
   * ms a drag must hover a collapsed branch before it auto-expands, or `false` to disable
   * hover auto-expand (DnD only). @default 500
   */
  autoExpandDelay?: number | false;
  /** Side-effect after a drop (persist/analytics); reverts the optimistic change on reject. */
  onDrop?: TreeViewDndProviderProps<TNode>["onDrop"];
  /** Fired when a drag starts. */
  onDragStart?: TreeViewDndProviderProps<TNode>["onDragStart"];
  /** Fired when a drag ends. */
  onDragEnd?: TreeViewDndProviderProps<TNode>["onDragEnd"];
  /** Veto a specific drop (also suppresses the indicator for rejected targets). */
  canDrop?: TreeViewDndProviderProps<TNode>["canDrop"];
  /** Values to move when dragging one node (e.g. the current multi-selection). */
  getDragValues?: TreeViewDndProviderProps<TNode>["getDragValues"];
  /** Extra data attached to the drag payload for cross-surface drops. */
  getExtraDragData?: TreeViewDndProviderProps<TNode>["getExtraDragData"];
  /** Render custom drag-preview content. */
  renderDragPreview?: TreeViewDndProviderProps<TNode>["renderDragPreview"];
  /** Build the screen-reader announcement for a completed drop. */
  getDropAnnouncement?: TreeViewDndProviderProps<TNode>["getDropAnnouncement"];
  /** Auto-scroll speed near the viewport edges during a drag. @default "standard" */
  autoScrollSpeed?: TreeViewDndProviderProps<TNode>["autoScrollSpeed"];
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

interface TreeRowProps {
  isBranch: boolean;
  checkable: boolean;
  indexPath: number[];
  children: ReactNode;
  actions: ReactNode | undefined;
  onPointerDown: (e: React.PointerEvent) => void;
}

const renderRowInner = ({
  isBranch,
  checkable,
  indexPath,
  children,
  actions,
  tail,
}: TreeRowProps & { tail?: ReactNode }) => (
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
    {tail}
  </>
);

// In virtualized mode nodes render flat (no Branch wrapper), so Ark UI cannot set --depth via
// DOM nesting — set it explicitly from indexPath.
const depthStyleFor = (indexPath: number[]) => ({ "--depth": indexPath.length }) as React.CSSProperties;

/** Row with no DnD wiring — used when the tree has no `onCollectionChange` (the common case). */
const PlainTreeRow = (props: TreeRowProps) =>
  props.isBranch ? (
    <TreeView.BranchControl
      onPointerDown={props.onPointerDown}
      style={depthStyleFor(props.indexPath)}
    >
      {renderRowInner(props)}
    </TreeView.BranchControl>
  ) : (
    <TreeView.Item
      onPointerDown={props.onPointerDown}
      style={depthStyleFor(props.indexPath)}
    >
      {renderRowInner(props)}
    </TreeView.Item>
  );

/** Row wired for drag/keyboard reordering; only mounted under a `TreeViewDndProvider`. */
const DndTreeRow = (props: TreeRowProps) => {
  const { ref, isDragging, instruction, dragPreview } = useTreeNodeDnd();
  const tail = (
    <>
      <TreeDropIndicator instruction={instruction} />
      {dragPreview}
    </>
  );
  return props.isBranch ? (
    <TreeView.BranchControl
      ref={ref}
      data-dragging={isDragging || undefined}
      onPointerDown={props.onPointerDown}
      style={depthStyleFor(props.indexPath)}
    >
      {renderRowInner({ ...props, tail })}
    </TreeView.BranchControl>
  ) : (
    <TreeView.Item
      ref={ref}
      data-dragging={isDragging || undefined}
      onPointerDown={props.onPointerDown}
      style={depthStyleFor(props.indexPath)}
    >
      {renderRowInner({ ...props, tail })}
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
  onCollectionChange,
  isNodeDraggable,
  blockReparent = false,
  autoExpandDelay,
  onDrop,
  onDragStart,
  onDragEnd,
  canDrop,
  getDragValues,
  getExtraDragData,
  renderDragPreview,
  getDropAnnouncement,
  autoScrollSpeed,
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

  // --- Drag and drop ---
  // Reorder against the original (unfiltered) collection; disabled while searching so the
  // rendered indexPaths (filteredCollection) always match the collection DnD mutates.
  const dndActive = onCollectionChange != null && filteredCollection === collection;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);
  // Non-DnD trees (the common case) render a plain row so every virtualized row skips the DnD hook.
  const RowComponent = onCollectionChange ? DndTreeRow : PlainTreeRow;

  // --- Render ---

  const showToolbar = showSearch || showSelectAll;

  const treeBody = (
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
          viewportRef={setScrollViewport}
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
                <RowComponent
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
                </RowComponent>
              </TreeView.NodeProvider>
            );
          }}
        </VirtualScrollArea>
      </TreeView.Tree>
    </TreeView.RootProvider>
  );

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
      {onCollectionChange ? (
        // Provider stays mounted; toggling `enabled` (e.g. when searching) never remounts the tree.
        <TreeViewDndProvider
          collection={collection}
          onCollectionChange={onCollectionChange}
          enabled={dndActive}
          blockReparent={blockReparent}
          autoExpandDelay={autoExpandDelay}
          isNodeDraggable={isNodeDraggable}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          canDrop={canDrop}
          getDragValues={getDragValues}
          getExtraDragData={getExtraDragData}
          renderDragPreview={renderDragPreview}
          getDropAnnouncement={getDropAnnouncement}
          autoScrollSpeed={autoScrollSpeed}
          scrollElement={scrollViewport}
        >
          {treeBody}
        </TreeViewDndProvider>
      ) : (
        treeBody
      )}
    </Flex>
  );
};
