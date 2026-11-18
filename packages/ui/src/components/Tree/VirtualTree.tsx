import {
  type TreeNode,
  type UseTreeViewProps,
  type UseTreeViewReturn,
  useTreeView,
  useTreeViewContext,
  useTreeViewNodeContext,
} from "@ark-ui/react/tree-view";
import { ChevronRightIcon } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Box } from "#styled-system/jsx";

import { useLatestRef } from "../../hooks/useLatestRef";
import { type ScrollAreaProps, VirtualScrollArea, type VisibleItems } from "../ScrollArea";
import type { ScrollToIndexRef } from "../ScrollArea/VirtualRows";
import { TreeDndRow, type TreeRowPartProps } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import { FlatBranchControl, FlatBranchIndicator, TreeRowContent, TreeView } from "./TreeView";

export type VirtualTreeViewProps<T extends TreeNode> = Omit<
  UseTreeViewProps<T>,
  "scrollToIndexFn" | "focusedValue" | "defaultFocusedValue"
>;

export interface VirtualTreeEntry<T extends TreeNode> {
  node: T;
  indexPath: number[];
}

export interface VirtualTreeView<T extends TreeNode> {
  /** The tree's API; give it to the enclosing `TreeView.RootProvider`. */
  api: UseTreeViewReturn<T>;
  /** The rows the tree shows, in order: every node whose ancestors are all expanded. */
  visibleNodes: VirtualTreeEntry<T>[];
  /** Index in `visibleNodes` of the row holding the tree's tab stop, or -1 when there is none. */
  tabStopIndex: number;
  /** Scrolls the row of `value` into view; false when no shown row has that value. */
  scrollTo: (value: string) => boolean;
  /** Scrolls the row of `value` into view and focuses it. */
  focus: (value: string) => void;
  /** Receives `VirtualTree`'s scroller, through which keyboard navigation reaches unrendered rows. */
  scrollToIndexRef: ScrollToIndexRef;
}

/**
 * `useTreeView` for a tree rendered by `VirtualTree`: keyboard navigation scrolls rows that aren't
 * rendered into view, and the focused row keeps the tab stop while it is scrolled away.
 */
export function useVirtualTreeView<T extends TreeNode>({
  onFocusChange,
  ...props
}: VirtualTreeViewProps<T>): VirtualTreeView<T> {
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const api = useTreeView({
    ...props,
    focusedValue,
    onFocusChange: (details) => {
      setFocusedValue(details.focusedValue);
      onFocusChange?.(details);
    },
    scrollToIndexFn: (details) => scrollToIndexRef.current?.(details.index),
  });

  const { collection } = api;
  const visibleNodes = api.getVisibleNodes();
  const indexOf = (value: string) =>
    visibleNodes.findIndex(({ node }) => collection.getNodeValue(node) === value);
  const focusedIndex = focusedValue === null ? -1 : indexOf(focusedValue);
  if (focusedValue !== null && focusedIndex < 0) setFocusedValue(null);
  // Matches zag's tab stop while nothing is focused.
  const tabStopIndex =
    focusedIndex >= 0
      ? focusedIndex
      : visibleNodes.findIndex(({ node }) => !collection.getNodeDisabled(node));

  const scrollTo = (value: string) => {
    const index = indexOf(value);
    if (index < 0) return false;
    scrollToIndexRef.current?.(index);
    return true;
  };

  return {
    api,
    visibleNodes,
    tabStopIndex,
    scrollToIndexRef,
    scrollTo,
    focus: (value) => {
      if (!scrollTo(value)) return;
      // Taking the tab stop keeps the row mounted until the scroll renders it.
      setFocusedValue(value);
      requestAnimationFrame(() => api.focus(value));
    },
  };
}

// Virtualized rows render flat, so Ark can't derive --depth from nesting.
const depthStyleFor = (indexPath: number[]): CSSProperties & { "--depth": number } => ({
  "--depth": indexPath.length,
});

const stickyIndexOf = (
  nodes: readonly VirtualTreeEntry<TreeNode>[],
  { firstVisible, firstUncut }: VisibleItems,
) => {
  const depth = nodes[firstVisible]?.indexPath.length ?? 0;
  if (depth < 2) return -1;
  let index = firstVisible - 1;
  while (index >= 0 && nodes[index].indexPath.length !== depth - 1) index--;
  return index >= 0 && (firstUncut < 0 || index < firstUncut) ? index : -1;
};

interface StickyBranchProps {
  indexPath: number[];
  children: ReactNode;
  onActivate: () => void;
  onHeightChange: (height: number) => void;
}

const StickyBranch = ({ indexPath, children, onActivate, onHeightChange }: StickyBranchProps) => {
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
        data-scope="tree-view"
        data-part="sticky-branch"
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
        {children}
      </FlatBranchControl>
    </Box>
  );
};

export interface VirtualTreeProps<T extends TreeNode> extends Omit<ScrollAreaProps, "children"> {
  /** From `useVirtualTreeView`, whose `api` the enclosing `TreeView.RootProvider` holds. */
  tree: VirtualTreeView<T>;
  /** Estimated row height in px; rows are measured once rendered. */
  rowHeight: number;
  /**
   * Pins the heading of the branch holding the topmost visible row above the list while its
   * children scroll by; clicking it scrolls back to the branch. @default false
   */
  stickyBranches?: boolean;
  /** What the pinned heading shows after its chevron. Defaults to the branch label. */
  renderStickyBranch?: (entry: VirtualTreeEntry<T>) => ReactNode;
  /** Renders one row, usually a `VirtualTreeRow`, inside its node's `TreeView.NodeProvider`. */
  children: (entry: VirtualTreeEntry<T>) => ReactNode;
}

/**
 * The scrolling body of a tree that renders only the rows in view. Place it inside `TreeView.Tree`
 * under a `TreeView.RootProvider` driven by `useVirtualTreeView`.
 */
export const VirtualTree = <T extends TreeNode>({
  tree,
  rowHeight,
  stickyBranches = false,
  renderStickyBranch,
  children,
  ...scrollAreaProps
}: VirtualTreeProps<T>) => {
  const { api, visibleNodes, tabStopIndex, scrollToIndexRef } = tree;
  const { collection } = api;

  const [stickyValue, setStickyValue] = useState<string | null>(null);
  const [stickyHeight, setStickyHeight] = useState<number>();
  const visibleItemsRef = useRef<VisibleItems | null>(null);
  const latest = useLatestRef({ visibleNodes, collection });

  // State holds only the pinned branch, so scrolling between its rows doesn't re-render the tree.
  const syncSticky = useCallback(() => {
    const { visibleNodes: nodes, collection: nodeCollection } = latest.current;
    const index = visibleItemsRef.current ? stickyIndexOf(nodes, visibleItemsRef.current) : -1;
    setStickyValue(index < 0 ? null : nodeCollection.getNodeValue(nodes[index].node));
  }, [latest]);

  const handleVisibleItems = useCallback(
    (items: VisibleItems) => {
      visibleItemsRef.current = items;
      syncSticky();
    },
    [syncSticky],
  );

  useLayoutEffect(() => {
    if (stickyBranches) syncSticky();
  }, [stickyBranches, visibleNodes, syncSticky]);

  const stickyIndex =
    stickyBranches && stickyValue !== null
      ? visibleNodes.findIndex(({ node }) => collection.getNodeValue(node) === stickyValue)
      : -1;
  const stickyEntry = stickyIndex >= 0 ? visibleNodes[stickyIndex] : undefined;

  const getItemKey = useCallback(
    (index: number) => collection.getNodeValue(visibleNodes[index].node),
    [collection, visibleNodes],
  );

  const renderRow = useCallback(
    (entry: VirtualTreeEntry<T>) => (
      <TreeView.NodeProvider
        node={entry.node}
        indexPath={entry.indexPath}
      >
        {children(entry)}
      </TreeView.NodeProvider>
    ),
    [children],
  );

  return (
    <VirtualScrollArea
      items={visibleNodes}
      itemHeight={rowHeight}
      getItemKey={getItemKey}
      scrollToIndexRef={scrollToIndexRef}
      keepMountedIndex={tabStopIndex >= 0 ? tabStopIndex : undefined}
      scrollbars="vertical"
      measure
      {...scrollAreaProps}
      onVisibleItemsChange={stickyBranches ? handleVisibleItems : undefined}
      scrollPaddingStart={stickyBranches ? (stickyHeight ?? rowHeight) : undefined}
      header={
        stickyEntry && (
          <TreeView.NodeProvider
            node={stickyEntry.node}
            indexPath={stickyEntry.indexPath}
          >
            <StickyBranch
              indexPath={stickyEntry.indexPath}
              onHeightChange={setStickyHeight}
              onActivate={() => {
                const value = collection.getNodeValue(stickyEntry.node);
                scrollToIndexRef.current?.(stickyIndex);
                requestAnimationFrame(() => api.focus(value));
              }}
            >
              {renderStickyBranch?.(stickyEntry) ?? (
                <TreeRowContent>
                  <TreeView.BranchText>
                    {collection.stringifyNode(stickyEntry.node)}
                  </TreeView.BranchText>
                </TreeRowContent>
              )}
            </StickyBranch>
          </TreeView.NodeProvider>
        )
      }
    >
      {renderRow}
    </VirtualScrollArea>
  );
};

export type VirtualTreeRowProps = Omit<TreeRowPartProps, "isBranch">;

/**
 * One row of a `VirtualTree`: the node's `TreeView.BranchControl` or `TreeView.Item`, announced as
 * a tree item at its level and indented with guides as if nested. Children are its content, such
 * as `TreeView.BranchIndicator` and `TreeView.BranchText` for a branch.
 */
export function VirtualTreeRow({ style, children, ...props }: VirtualTreeRowProps) {
  const tree = useTreeViewContext();
  const { isBranch, expanded, disabled, indexPath } = useTreeViewNodeContext();

  return (
    <TreeDndRow
      isBranch={isBranch}
      role={isBranch ? "treeitem" : undefined}
      aria-expanded={isBranch ? expanded : undefined}
      aria-level={isBranch ? indexPath.length : undefined}
      aria-setsize={tree.collection.getSiblingNodes(indexPath).length}
      aria-posinset={indexPath[indexPath.length - 1] + 1}
      aria-disabled={disabled || undefined}
      {...props}
      style={{ ...depthStyleFor(indexPath), ...style }}
    >
      <TreeRowIndentGuides indexPath={indexPath} />
      {children}
    </TreeDndRow>
  );
}
