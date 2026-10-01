import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { useTreeView } from "@ark-ui/react/tree-view";
import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";

import { TooltipIconButton } from "../Buttons";
import { SelectionSearchField } from "../Listbox/managed";
import { VirtualScrollArea } from "../ScrollArea";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { collectBranchesWithLeafDescendants, filterTreeCollection } from "./treeCollectionUtils";
import { TreeDndRow, TreeNodeLabel, type TreeNodeRenderDetails, TreeRowPart } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import { TreeView } from "./TreeView";

type TreeSize = "sm" | "md";

// Must match the recipe's row padding-y + line-height per size.
const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};

export interface TreeSelectListProps<TNode extends TreeNode> {
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
  /** Determine whether a node should show a checkbox. Defaults to true for all nodes. */
  isNodeCheckable?: (details: TreeNodeRenderDetails<TNode>) => boolean;
  /** Placeholder text for the search input. @default "Search..." */
  searchPlaceholder?: string;
  /** Custom search predicate. Receives the node and the lowercased query. */
  searchPredicate?: (node: TNode, query: string) => boolean;
  /** Show the search input. @default true */
  showSearch?: boolean;
  /** Show the select-all toggle button. @default true */
  showSelectAll?: boolean;
  /** Label of the select-all toggle while not everything is selected. @default "Select all" */
  selectAllLabel?: string;
  /** Label of the select-all toggle while everything is selected. @default "Deselect all" */
  clearAllLabel?: string;
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

const renderRowInner = ({ isBranch, checkable, indexPath, children, actions }: TreeRowProps) => (
  <>
    <TreeRowIndentGuides indexPath={indexPath} />
    {isBranch ? <TreeView.BranchIndicator /> : <TreeIndicatorSpacer />}
    {checkable && <TreeView.NodeCheckbox />}
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

// In virtualized mode nodes render flat (no Branch wrapper), so Ark UI cannot set --depth via
// DOM nesting — set it explicitly from indexPath.
const depthStyleFor = (indexPath: number[]): React.CSSProperties & { "--depth": number } => ({
  "--depth": indexPath.length,
});

/** Row with no DnD wiring — used when the tree has no `onCollectionChange` (the common case). */
const PlainTreeRow = (props: TreeRowProps) => (
  <TreeRowPart
    isBranch={props.isBranch}
    onPointerDown={props.onPointerDown}
    style={depthStyleFor(props.indexPath)}
  >
    {renderRowInner(props)}
  </TreeRowPart>
);

/** Row wired for drag/keyboard reordering; only mounted under a `TreeViewDndProvider`. */
const DndTreeRow = (props: TreeRowProps) => (
  <TreeDndRow
    isBranch={props.isBranch}
    onPointerDown={props.onPointerDown}
    style={depthStyleFor(props.indexPath)}
  >
    {renderRowInner(props)}
  </TreeDndRow>
);

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
  selectAllLabel = "Select all",
  clearAllLabel = "Deselect all",
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  maxHeight = "320px",
  size = "md",
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

  // --- Expansion state ---

  const allExpandedValue = useMemo(() => collection.getBranchValues(), [collection]);

  const [uncontrolledExpandedValue, setUncontrolledExpandedValue] = useState<string[]>(
    defaultExpandedValue ?? allExpandedValue,
  );

  const resolvedExpandedValue = expandedValue ?? uncontrolledExpandedValue;

  const filteredExpandableValueSet = useMemo(
    () => new Set(filteredCollection.getBranchValues()),
    [filteredCollection],
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

  const allSelectableValues = useMemo(() => collection.getDescendantValues([]), [collection]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const allSelected =
    allSelectableValues.length > 0 &&
    allSelectableValues.every((selectionValue) => selectedSet.has(selectionValue));
  const someSelected =
    !allSelected && allSelectableValues.some((selectionValue) => selectedSet.has(selectionValue));

  // --- Checkability ---

  const selectableSubtrees = useMemo(
    () =>
      collectBranchesWithLeafDescendants(
        filteredCollection,
        filteredCollection.getNodeChildren(filteredCollection.rootNode),
      ),
    [filteredCollection],
  );

  const resolvedIsNodeCheckable = useCallback(
    ({ node, indexPath, isBranch }: TreeNodeRenderDetails<TNode>) => {
      if (isBranch && !selectableSubtrees.has(filteredCollection.getNodeValue(node))) {
        return false;
      }
      return isNodeCheckable?.({ node, indexPath, isBranch }) ?? true;
    },
    [filteredCollection, isNodeCheckable, selectableSubtrees],
  );

  // --- Tree view hook ---

  const tree = useTreeView({
    collection: filteredCollection,
    checkedValue: value,
    onCheckedChange: (details) => onValueChange(details.checkedValue),
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

  const selectAllButton = showSelectAll && (
    <TooltipIconButton
      label={allSelected ? clearAllLabel : selectAllLabel}
      aria-label={allSelected ? clearAllLabel : selectAllLabel}
      size={selectAllButtonSize}
      variant="plain"
      color="fg.muted"
      mr="1"
      flexShrink={0}
      onClick={() => onValueChange(allSelected ? [] : allSelectableValues)}
    >
      {allSelected ? <SquareCheckIcon /> : someSelected ? <SquareMinusIcon /> : <SquareIcon />}
    </TooltipIconButton>
  );

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
                  {renderedNode ?? (
                    <TreeNodeLabel isBranch={isBranch}>
                      {filteredCollection.stringifyNode(node)}
                    </TreeNodeLabel>
                  )}
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
      {showSearch ? (
        <Box mb="2">
          <SelectionSearchField
            query={search}
            onQueryChange={setSearch}
            placeholder={searchPlaceholder}
            endElement={selectAllButton}
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
