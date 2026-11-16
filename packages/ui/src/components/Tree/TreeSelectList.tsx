import type {
  TreeCollection,
  TreeNode,
  TreeViewLoadChildrenCompleteDetails,
  TreeViewLoadChildrenDetails,
  TreeViewLoadChildrenErrorDetails,
  TreeViewNodeState,
  TreeViewRenameCompleteDetails,
} from "@ark-ui/react/tree-view";
import { useTreeView, useTreeViewContext, useTreeViewNodeContext } from "@ark-ui/react/tree-view";
import {
  CheckIcon,
  ChevronRightIcon,
  MinusIcon,
  SquareCheckIcon,
  SquareIcon,
  SquareMinusIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Box, Flex } from "#styled-system/jsx";
import type { TreeViewVariant } from "#styled-system/recipes";

import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";
import { SelectionSearchField, useSelectionSearch } from "../Listbox/managed";
import type { SelectionSearchOptions } from "../Listbox/types";
import { VirtualScrollArea, type VisibleItems } from "../ScrollArea";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./dnd/TreeDndContext";
import { filterTreeCollection } from "./treeCollectionUtils";
import { TreeDndRow, TreeNodeContent, type TreeNodeRenderDetails } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import {
  FlatBranchControl,
  FlatBranchIndicator,
  FlatNodeCheckbox,
  TreeRowContent,
  TreeView,
} from "./TreeView";
import { useTreeCheckSelection } from "./useTreeCheckSelection";
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
  /** Called when a rename is submitted, with the new label. */
  onRenameComplete?: (details: TreeViewRenameCompleteDetails) => void;
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
       * Loads a branch's children when it is expanded. A node needs loading while it has a
       * non-zero `childrenCount`, no `children` in `collection` and no finished load; a
       * `collection` not returned by `onLoadChildrenComplete` starts afresh. The branch stays
       * collapsed until the load finishes, then opens even if it came back empty.
       */
      loadChildren: (details: TreeViewLoadChildrenDetails<TNode>) => Promise<TNode[]>;
      /** Receives `collection` with the loaded `children` merged in; pass it back as `collection`. */
      onLoadChildrenComplete: (details: TreeViewLoadChildrenCompleteDetails<TNode>) => void;
      /** Called when `loadChildren` rejects; the branch stays collapsed and retries on next expand. */
      onLoadChildrenError?: (details: TreeViewLoadChildrenErrorDetails<TNode>) => void;
    };

export type TreeSelectListProps<TNode extends TreeNode> = TreeSelectListBaseProps<TNode> &
  TreeSelectListLoadProps<TNode>;

interface TreeSelectRowProps {
  loading: boolean;
  checkable: boolean;
  checked: TreeViewNodeState["checked"];
  actions: ReactNode;
  children: ReactNode;
  onToggleChecked: () => void;
}

// Virtualized rows render flat, so Ark can't derive --depth from nesting.
const depthStyleFor = (indexPath: number[]): React.CSSProperties & { "--depth": number } => ({
  "--depth": indexPath.length,
});

const TreeSelectRow = ({
  loading,
  checkable,
  checked,
  actions,
  children,
  onToggleChecked,
}: TreeSelectRowProps) => {
  const tree = useTreeViewContext();
  const { value, isBranch, expanded, renaming, disabled, indexPath } = useTreeViewNodeContext();

  return (
    <TreeDndRow
      isBranch={isBranch}
      loading={loading}
      role={isBranch ? "treeitem" : undefined}
      aria-expanded={isBranch ? expanded : undefined}
      aria-level={isBranch ? indexPath.length : undefined}
      aria-setsize={tree.collection.getSiblingNodes(indexPath).length}
      aria-posinset={indexPath[indexPath.length - 1] + 1}
      aria-disabled={disabled || undefined}
      aria-checked={checkable ? (checked === "indeterminate" ? "mixed" : checked) : undefined}
      onPointerDown={(e) => {
        if (e.button !== 0 || renaming) return;
        tree.focus(value);
      }}
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
      {isBranch ? <TreeView.BranchIndicator /> : <FlatBranchIndicator aria-hidden="true" />}
      {checkable && (
        <TreeView.NodeCheckbox
          aria-hidden
          data-state={
            checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked"
          }
          onClick={(e) => {
            // Bails out zag's own toggle, which would also check unselectable leaves.
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.closest<HTMLElement>("[role=treeitem]")?.focus({ preventScroll: true });
            onToggleChecked();
          }}
        >
          {checked === "indeterminate" ? <MinusIcon /> : checked && <CheckIcon />}
        </TreeView.NodeCheckbox>
      )}
      <TreeRowContent>{renaming ? <TreeView.NodeRenameInput /> : children}</TreeRowContent>
      {actions && !renaming && <TreeView.NodeActions>{actions}</TreeView.NodeActions>}
    </TreeDndRow>
  );
};

const samePath = (a: number[], b: number[]) =>
  a.length === b.length && a.every((step, index) => step === b[index]);

interface StickyBranchProps {
  indexPath: number[];
  checkable: boolean;
  children: ReactNode;
  onActivate: () => void;
  onHeightChange: (height: number) => void;
}

const StickyBranch = ({
  indexPath,
  checkable,
  children,
  onActivate,
  onHeightChange,
}: StickyBranchProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    onHeightChange(row.offsetHeight);
    const observer = new ResizeObserver(() => onHeightChange(row.offsetHeight));
    observer.observe(row);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <Box
      position="sticky"
      top="0"
      height="0"
      zIndex="2"
    >
      <FlatBranchControl
        ref={rowRef}
        aria-hidden="true"
        data-state="open"
        borderBottomWidth="1px"
        borderColor="border"
        css={{ "--tree-row-bg": "var(--surface-bg, {colors.bg})" }}
        style={depthStyleFor(indexPath)}
        onClick={onActivate}
      >
        <FlatBranchIndicator data-state="open">
          <ChevronRightIcon />
        </FlatBranchIndicator>
        {checkable && <FlatNodeCheckbox style={{ visibility: "hidden" }} />}
        <TreeRowContent>{children}</TreeRowContent>
      </FlatBranchControl>
    </Box>
  );
};

export const TreeSelectList = <TNode extends TreeNode>({
  collection,
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
  onCollectionChange,
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

  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const tree = useTreeView({
    collection: displayedCollection,
    checkedValue: value,
    onCheckedChange: (details) => checks.setCheckedValue(details.checkedValue),
    expandedValue: expansion.visibleExpandedValue,
    onExpandedChange: (details) => handleExpandedChange(details.expandedValue),
    focusedValue,
    onFocusChange: (details) => setFocusedValue(details.focusedValue),
    scrollToIndexFn: (details) => scrollToIndexRef.current?.(details.index),
    selectedValue: [],
    onSelectionChange: () => {}, // No selection management (focus only) since it interferes with checkbox interactions
    canRename:
      canRename &&
      ((node, indexPath) =>
        canRename(nodeDetails(node, indexPath, displayedCollection.isBranchNode(node)))),
    onRenameComplete:
      onRenameComplete &&
      ((details) =>
        onRenameComplete({ ...details, indexPath: toSourceIndexPath(details.indexPath) })),
  });

  const visibleNodes = tree.getVisibleNodes();
  const focusedIndex =
    focusedValue === null
      ? -1
      : visibleNodes.findIndex(
          ({ node }) => displayedCollection.getNodeValue(node) === focusedValue,
        );
  if (focusedValue !== null && focusedIndex < 0) setFocusedValue(null);
  // Matches zag's tab stop while nothing is focused.
  const tabStopIndex =
    focusedIndex >= 0
      ? focusedIndex
      : visibleNodes.findIndex(({ node }) => !displayedCollection.getNodeDisabled(node));

  const [firstVisibleIndex, setFirstVisibleIndex] = useState(-1);
  const [firstUncutIndex, setFirstUncutIndex] = useState(-1);
  const [stickyHeight, setStickyHeight] = useState<number>();
  const handleVisibleItems = useCallback(({ firstVisible, firstUncut }: VisibleItems) => {
    setFirstVisibleIndex(firstVisible);
    setFirstUncutIndex(firstUncut);
  }, []);
  const firstVisible = stickyBranches ? visibleNodes[firstVisibleIndex] : undefined;
  const stickyPath =
    firstVisible && firstVisible.indexPath.length > 1 ? firstVisible.indexPath.slice(0, -1) : null;
  const stickyIndex = stickyPath
    ? visibleNodes.findIndex(({ indexPath }) => samePath(indexPath, stickyPath))
    : -1;
  const branchScrolledAway = firstUncutIndex < 0 || stickyIndex < firstUncutIndex;
  const stickyEntry =
    stickyIndex >= 0 && branchScrolledAway ? visibleNodes[stickyIndex] : undefined;

  // Disabled during a query so rendered indexPaths match the source collection DnD mutates.
  const dndActive = onCollectionChange != null && !queryActive;
  const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);

  const handleCollectionChange = (nextCollection: TreeCollection<TNode>) => {
    lazyLoad.carry(collection, nextCollection);
    onCollectionChange?.(nextCollection);
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
      <VirtualScrollArea
        items={visibleNodes}
        itemHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
        getItemKey={(index) => displayedCollection.getNodeValue(visibleNodes[index].node)}
        height={listHeight}
        maxHeight={listHeight}
        ref={setScrollViewport}
        scrollToIndexRef={scrollToIndexRef}
        keepMountedIndex={tabStopIndex >= 0 ? tabStopIndex : undefined}
        scrollbars="vertical"
        measure
        p="2"
        onVisibleItemsChange={stickyBranches ? handleVisibleItems : undefined}
        scrollPaddingStart={
          stickyBranches ? (stickyHeight ?? TREE_ROW_HEIGHT_ESTIMATE[size]) : undefined
        }
        header={
          stickyEntry && (
            <TreeView.NodeProvider
              node={stickyEntry.node}
              indexPath={stickyEntry.indexPath}
            >
              <StickyBranch
                indexPath={stickyEntry.indexPath}
                checkable={checks.isCheckable({
                  node: stickyEntry.node,
                  indexPath: stickyEntry.indexPath,
                  isBranch: true,
                })}
                onHeightChange={setStickyHeight}
                onActivate={() => {
                  const stickyValue = displayedCollection.getNodeValue(stickyEntry.node);
                  scrollToIndexRef.current?.(stickyIndex);
                  requestAnimationFrame(() => tree.focus(stickyValue));
                }}
              >
                <TreeNodeContent
                  details={nodeDetails(stickyEntry.node, stickyEntry.indexPath, true)}
                  renderNode={renderNode}
                />
              </StickyBranch>
            </TreeView.NodeProvider>
          )
        }
      >
        {({ node, indexPath }) => {
          const nodeValue = displayedCollection.getNodeValue(node);
          const isBranch = displayedCollection.isBranchNode(node);
          const details = nodeDetails(node, indexPath, isBranch);
          const checkable = checks.isCheckable({ node, indexPath, isBranch });

          return (
            <TreeView.NodeProvider
              key={nodeValue}
              node={node}
              indexPath={indexPath}
            >
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
            </TreeView.NodeProvider>
          );
        }}
      </VirtualScrollArea>
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
      <TreeView.RootProvider
        value={tree as ReturnType<typeof useTreeView>}
        size={size}
        actionsVisibility={actionsVisibility}
        clampText={clampText}
      >
        {onCollectionChange ? (
          // Keep the provider mounted: toggling `disabled` must not remount the tree.
          <TreeViewDndProvider
            {...dndProps}
            onCollectionChange={handleCollectionChange}
            isBranchLoaded={(treeValue) => !lazyLoad.needsLoad(treeValue)}
            disabled={!dndActive}
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
