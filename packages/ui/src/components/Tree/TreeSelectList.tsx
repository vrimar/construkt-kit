import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";
import type { TreeViewVariant } from "#styled-system/recipes";

import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";
import { SelectionSearchField, useSelectionSearch } from "../Listbox/managed";
import type { SelectionSearchOptions } from "../Listbox/types";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { type TreeCheckedState, TreeCollection, type TreeNodes } from "./treeCollection";
import { filterTreeCollection } from "./treeCollectionUtils";
import { TreeNodeContent, type TreeNodeRenderDetails } from "./TreeRow";
import {
  FlatBranchIndicator,
  FlatNodeCheckbox,
  type TreeRenameDetails,
  TreeRowContent,
  TreeView,
  useTreeNodeState,
} from "./TreeView";
import { useTreeCheckSelection } from "./useTreeCheckSelection";
import {
  type TreeLoadChildrenDetails,
  type TreeLoadChildrenErrorDetails,
  useTreeLazyLoad,
} from "./useTreeLazyLoad";
import { useTreeSearchExpansion } from "./useTreeSearchExpansion";
import { VirtualTree, type VirtualTreeEntry, VirtualTreeRow } from "./VirtualTree";

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

type TreeSelectListDndProps<TNode> = Pick<
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

interface TreeSelectListBaseProps<TNode> extends TreeNodes<TNode>, TreeSelectListDndProps<TNode> {
  /** Controlled selected leaf-node IDs. */
  value: string[];
  /** Callback when selected values change. */
  onValueChange: (value: string[]) => void;
  /** Render custom node content. Defaults to the node label. */
  renderNode?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /** Render actions aligned to the end of a row. */
  renderActions?: (details: TreeNodeRenderDetails<TNode>) => ReactNode;
  /**
   * `hover` shows row actions over the end of the row only while it is hovered, focused within or
   * holding an open menu, and always on touch screens. @default "always"
   */
  actionsVisibility?: TreeViewVariant["actionsVisibility"];
  /** Wrap node text onto up to two lines instead of truncating it. @default false */
  clampText?: boolean;
  /**
   * Pins the branch heading of the topmost visible row above the list while its children scroll
   * by. @default false
   */
  stickyBranches?: boolean;
  /** Lets F2 rename the focused node when it returns true. */
  canRename?: (details: TreeNodeRenderDetails<TNode>) => boolean;
  /** Called when a rename is submitted, with the node's value and its new label. */
  onRenameComplete?: (value: string, details: TreeRenameDetails) => void;
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
   * Enables drag-and-drop reordering. Called with the reordered nodes after a drop.
   * DnD is automatically disabled while a search query is active.
   */
  onNodesChange?: (nodes: TNode[]) => void;
}

type TreeSelectListLoadProps<TNode> =
  | { loadChildren?: never; onLoadChildrenComplete?: never; onLoadChildrenError?: never }
  | {
      /**
       * Loads a branch's children when it is expanded. A node needs loading while it has a
       * non-zero children count, no children and no finished load; `nodes` not handed back by
       * `onLoadChildrenComplete` start afresh. The branch stays collapsed until the load
       * finishes, then opens even if it came back empty.
       */
      loadChildren: (node: TNode, details: TreeLoadChildrenDetails) => Promise<TNode[]>;
      /** Receives `nodes` with the loaded children merged in; pass them back as `nodes`. */
      onLoadChildrenComplete: (nodes: TNode[]) => void;
      /** Called when `loadChildren` rejects; the branch stays collapsed and retries on next expand. */
      onLoadChildrenError?: (error: unknown, details: TreeLoadChildrenErrorDetails<TNode>) => void;
    };

export type TreeSelectListProps<TNode> = TreeSelectListBaseProps<TNode> &
  TreeSelectListLoadProps<TNode>;

interface TreeSelectRowProps {
  loading: boolean;
  checkable: boolean;
  checked: TreeCheckedState;
  actions: ReactNode;
  children: ReactNode;
  onToggleChecked: () => void;
}

const TreeSelectRow = ({
  loading,
  checkable,
  checked,
  actions,
  children,
  onToggleChecked,
}: TreeSelectRowProps) => {
  const { isBranch, renaming } = useTreeNodeState();

  return (
    <VirtualTreeRow
      loading={loading}
      aria-checked={checkable ? (checked === "indeterminate" ? "mixed" : checked) : undefined}
      onKeyDown={(e) => {
        if (!checkable || e.target !== e.currentTarget) return;
        if (e.key === " " || (e.key === "Enter" && !isBranch)) {
          e.preventDefault();
          onToggleChecked();
        }
      }}
    >
      {isBranch ? <TreeView.BranchIndicator /> : <FlatBranchIndicator aria-hidden="true" />}
      {checkable && (
        <TreeView.NodeCheckbox
          checked={checked}
          onClick={(e) => {
            // Bails out the root's own toggle, which would also check unselectable leaves.
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.closest<HTMLElement>("[role=treeitem]")?.focus({ preventScroll: true });
            onToggleChecked();
          }}
        />
      )}
      <TreeRowContent>{renaming ? <TreeView.NodeRenameInput /> : children}</TreeRowContent>
      {actions && !renaming && <TreeView.NodeActions>{actions}</TreeView.NodeActions>}
    </VirtualTreeRow>
  );
};

const NO_SELECTION: string[] = [];

export const TreeSelectList = <TNode,>({
  nodes,
  getNodeValue,
  getNodeLabel,
  getChildren,
  getChildrenCount,
  isNodeDisabled,
  value,
  onValueChange,
  renderNode,
  renderActions,
  actionsVisibility,
  clampText,
  stickyBranches = false,
  canRename,
  onRenameComplete,
  isNodeCheckable,
  search: searchOptions,
  showSelectAll = true,
  selectAllLabel = "Select all",
  clearAllLabel = "Deselect all",
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  listHeight = "320px",
  size = "md",
  onNodesChange,
  expandOnSearch = true,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  ...dndProps
}: TreeSelectListProps<TNode>) => {
  const search = useSelectionSearch(searchOptions ?? true);
  const { normalizedQuery, filterQuery } = search;
  const queryActive = normalizedQuery !== "";
  const searchFilter = searchOptions?.filter;

  const collection = useMemo(
    () =>
      new TreeCollection(nodes, {
        getNodeValue,
        getNodeLabel,
        getChildren,
        getChildrenCount,
        isNodeDisabled,
      }),
    [nodes, getNodeValue, getNodeLabel, getChildren, getChildrenCount, isNodeDisabled],
  );

  const displayedCollection = useMemo(
    () => filterTreeCollection(collection, filterQuery, searchFilter),
    [collection, filterQuery, searchFilter],
  );

  const lazyLoad = useTreeLazyLoad({
    collection,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
    abortKey: search.external ? normalizedQuery : "",
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

  const toSourceIndexPath = useCallback(
    (indexPath: number[]) =>
      displayedCollection === collection
        ? indexPath
        : collection.getIndexPath(displayedCollection.getValuePath(indexPath)),
    [collection, displayedCollection],
  );

  const nodeDetails = (node: TNode, indexPath: number[], isBranch: boolean) => ({
    node,
    indexPath: toSourceIndexPath(indexPath),
    isBranch,
  });

  const checks = useTreeCheckSelection({
    collection,
    displayedCollection,
    value,
    onValueChange,
    isNodeCheckable,
    toSourceIndexPath,
  });
  const { selectAll } = checks;

  // Disabled during a query so rendered indexPaths match the source nodes DnD mutates.
  const dndActive = onNodesChange != null && !queryActive;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);

  const handleNodesChange = (nextNodes: TNode[]) => {
    lazyLoad.carry(nodes, nextNodes);
    onNodesChange?.(nextNodes);
  };

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
      <VirtualTree<TNode>
        rowHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
        height={listHeight}
        maxHeight={listHeight}
        ref={setScrollViewport}
        p="2"
        stickyBranches={stickyBranches}
        renderStickyBranch={({ node, indexPath }) => (
          <>
            {checks.isCheckable({ node, indexPath, isBranch: true }) && (
              <FlatNodeCheckbox style={{ visibility: "hidden" }} />
            )}
            <TreeRowContent>
              <TreeNodeContent
                details={nodeDetails(node, indexPath, true)}
                renderNode={renderNode}
              />
            </TreeRowContent>
          </>
        )}
      >
        {({ node, indexPath }: VirtualTreeEntry<TNode>) => {
          const nodeValue = displayedCollection.getNodeValue(node);
          const isBranch = displayedCollection.isBranchNode(node);
          const details = nodeDetails(node, indexPath, isBranch);
          const checkable = checks.isCheckable({ node, indexPath, isBranch });

          return (
            <TreeSelectRow
              loading={lazyLoad.loadingValues.has(nodeValue)}
              checkable={checkable}
              checked={checkable && checks.checkedState(node, isBranch)}
              actions={renderActions?.(details)}
              onToggleChecked={() => checks.toggle(node, isBranch)}
            >
              <TreeNodeContent
                details={details}
                renderNode={renderNode}
              />
            </TreeSelectRow>
          );
        }}
      </VirtualTree>
    </TreeView.Tree>
  );

  return (
    <Flex direction="column">
      {search.showInput ? (
        <Box mb="2">
          <SelectionSearchField
            search={search}
            endElement={
              <>
                {search.endElement}
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
      <TreeView.Root
        nodes={displayedCollection.nodes}
        getNodeValue={getNodeValue}
        getNodeLabel={getNodeLabel}
        getChildren={displayedCollection.accessors.getChildren}
        getChildrenCount={getChildrenCount}
        isNodeDisabled={isNodeDisabled}
        expandedValue={expansion.visibleExpandedValue}
        onExpandedChange={handleExpandedChange}
        selectedValue={NO_SELECTION}
        canRename={
          canRename &&
          ((node: TNode, indexPath: number[]) =>
            canRename(nodeDetails(node, indexPath, displayedCollection.isBranchNode(node))))
        }
        onRenameComplete={
          onRenameComplete &&
          ((renamed: string, details: TreeRenameDetails) =>
            onRenameComplete(renamed, {
              ...details,
              indexPath: toSourceIndexPath(details.indexPath),
            }))
        }
        size={size}
        actionsVisibility={actionsVisibility}
        clampText={clampText}
      >
        {onNodesChange ? (
          // Keep the provider mounted: toggling `disabled` must not remount the tree.
          <TreeViewDndProvider
            {...dndProps}
            onNodesChange={handleNodesChange}
            isBranchLoaded={(treeValue) => !lazyLoad.needsLoad(treeValue)}
            disabled={!dndActive}
            scrollElement={scrollViewport}
          >
            {treeBody}
          </TreeViewDndProvider>
        ) : (
          treeBody
        )}
      </TreeView.Root>
    </Flex>
  );
};
