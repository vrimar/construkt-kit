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
import { useCallback, useMemo, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";

import { TooltipIconButton } from "../Buttons";
import { SelectionSearchField, normalizeQuery } from "../Listbox/managed";
import { VirtualScrollArea } from "../ScrollArea";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { collectBranchesWithLeafDescendants, filterTreeCollection } from "./treeCollectionUtils";
import { TreeDndRow, TreeNodeLabel, type TreeNodeRenderDetails, TreeRowPart } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import { TreeView } from "./TreeView";
import { useTreeLazyLoad } from "./useTreeLazyLoad";
import { useTreeSearchExpansion } from "./useTreeSearchExpansion";

type TreeSize = "sm" | "md";

// Must match the recipe's row padding-y + line-height per size.
const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};

export type TreeSelectListSearchMode = "filter" | "external";

interface TreeSelectListBaseProps<TNode extends TreeNode> {
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
  /**
   * Custom search predicate. Receives the node and the lowercased query. Unused when
   * `searchMode` is `"external"`.
   */
  searchPredicate?: (node: TNode, query: string) => boolean;
  /** Show the search input. @default true */
  showSearch?: boolean;
  /** Controlled search query. */
  query?: string;
  /** Initial search query (uncontrolled). @default "" */
  defaultQuery?: string;
  /** Callback when the search query changes. */
  onQueryChange?: (query: string) => void;
  /**
   * `"filter"` filters `collection` by the query. `"external"` renders `collection` as given so
   * the consumer can filter it (e.g. server-side) from `onQueryChange`. @default "filter"
   */
  searchMode?: TreeSelectListSearchMode;
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
  /** Height of the scroll area. @default "320px" */
  listHeight?: string;
  /** Size variant. @default "md" */
  size?: TreeSize;
  /**
   * Enables drag-and-drop reordering. Called with the reordered collection after a drop.
   * DnD is automatically disabled while a search query is active.
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
  loading: boolean;
  checkable: boolean;
  indexPath: number[];
  children: ReactNode;
  actions: ReactNode | undefined;
  onPointerDown: (e: React.PointerEvent) => void;
}

const renderRowInner = ({
  isBranch,
  loading,
  checkable,
  indexPath,
  children,
  actions,
}: TreeRowProps) => (
  <>
    <TreeRowIndentGuides indexPath={indexPath} />
    {isBranch ? (
      <TreeView.BranchIndicator data-loading={loading || undefined} />
    ) : (
      <TreeIndicatorSpacer />
    )}
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
    loading={props.loading}
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
    loading={props.loading}
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
  listHeight = "320px",
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
  query,
  defaultQuery = "",
  onQueryChange,
  searchMode = "filter",
  expandOnSearch = true,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
}: TreeSelectListProps<TNode>) => {
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const resolvedQuery = query ?? internalQuery;
  const normalizedQuery = normalizeQuery(resolvedQuery);
  const queryActive = normalizedQuery !== "";
  const selectAllButtonSize = size === "sm" ? "xs" : "sm";

  const setQuery = (nextQuery: string) => {
    if (query === undefined) setInternalQuery(nextQuery);
    onQueryChange?.(nextQuery);
  };

  // --- Filtering ---

  const displayedCollection = useMemo(
    () =>
      filterTreeCollection(
        collection,
        searchMode === "external" ? "" : resolvedQuery,
        searchPredicate,
      ),
    [collection, resolvedQuery, searchMode, searchPredicate],
  );

  // --- Expansion state ---

  const lazyLoad = useTreeLazyLoad({
    collection,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
    onLoaded: (treeValue) => expansion.expand(treeValue),
    abortKey: searchMode === "external" ? normalizedQuery : "",
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
    lazyLoad.start(deferredValues);
    expansion.setExpandedValue(
      nextExpandedValue.filter((treeValue) => !deferredValues.includes(treeValue)),
    );
  };

  // --- Select all ---

  // Filtering keeps a matching branch with no children, which then reads as a leaf.
  const leafValueSet = useMemo(() => new Set(collection.getDescendantValues([])), [collection]);
  const displayedLeafValues = useMemo(
    () =>
      displayedCollection
        .getDescendantValues([])
        .filter((leafValue) => leafValueSet.has(leafValue)),
    [displayedCollection, leafValueSet],
  );

  const selectedSet = useMemo(() => new Set(value), [value]);

  const allSelected =
    displayedLeafValues.length > 0 &&
    displayedLeafValues.every((selectionValue) => selectedSet.has(selectionValue));
  const someSelected =
    !allSelected && displayedLeafValues.some((selectionValue) => selectedSet.has(selectionValue));

  const toggleSelectAll = () => {
    if (!allSelected) {
      onValueChange([
        ...value,
        ...displayedLeafValues.filter((leafValue) => !selectedSet.has(leafValue)),
      ]);
      return;
    }
    const displayedLeafSet = new Set(displayedLeafValues);
    onValueChange(value.filter((selectionValue) => !displayedLeafSet.has(selectionValue)));
  };

  // --- Checkability ---

  const selectableSubtrees = useMemo(
    () =>
      collectBranchesWithLeafDescendants(
        displayedCollection,
        displayedCollection.getNodeChildren(displayedCollection.rootNode),
      ),
    [displayedCollection],
  );

  const resolvedIsNodeCheckable = useCallback(
    ({ node, indexPath, isBranch }: TreeNodeRenderDetails<TNode>) => {
      if (isBranch && !selectableSubtrees.has(displayedCollection.getNodeValue(node))) {
        return false;
      }
      return isNodeCheckable?.({ node, indexPath, isBranch }) ?? true;
    },
    [displayedCollection, isNodeCheckable, selectableSubtrees],
  );

  // --- Tree view hook ---

  const tree = useTreeView({
    collection: displayedCollection,
    checkedValue: value,
    onCheckedChange: (details) => onValueChange(details.checkedValue),
    expandedValue: expansion.visibleExpandedValue,
    onExpandedChange: (details) => handleExpandedChange(details.expandedValue),
    selectedValue: [],
    onSelectionChange: () => {}, // No selection management (focus only) since it interferes with checkbox interactions
  });

  const visibleNodes = tree.getVisibleNodes();

  // --- Drag and drop ---
  // Disabled during a query so rendered indexPaths match the source collection DnD mutates.
  const dndActive = onCollectionChange != null && !queryActive;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);
  // Non-DnD trees (the common case) render a plain row so every virtualized row skips the DnD hook.
  const RowComponent = onCollectionChange ? DndTreeRow : PlainTreeRow;

  const resolvedCanDrop: TreeViewDndProviderProps<TNode>["canDrop"] = (details) => {
    if (details.instruction.type === "make-child" && lazyLoad.needsLoad(details.targetValue)) {
      return false;
    }
    return canDrop?.(details) ?? true;
  };

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
      onClick={toggleSelectAll}
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
          getItemKey={(index) => displayedCollection.getNodeValue(visibleNodes[index].node)}
          height={listHeight}
          maxHeight={listHeight}
          viewportRef={setScrollViewport}
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
                <RowComponent
                  isBranch={isBranch}
                  loading={lazyLoad.loadingValues.has(nodeValue)}
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
                      {displayedCollection.stringifyNode(node)}
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
            query={resolvedQuery}
            onQueryChange={setQuery}
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
          canDrop={resolvedCanDrop}
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
