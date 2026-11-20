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
import { useStore } from "../../primitives/store";
import { type ScrollAreaProps, VirtualScrollArea, type VisibleItems } from "../ScrollArea";
import { TreeDndRow, type TreeRowPartProps } from "./TreeRow";
import { TreeRowIndentGuides } from "./TreeRowIndentGuides";
import {
  FlatBranchControl,
  FlatBranchIndicator,
  TreeRowContent,
  TreeView,
  ariaChecked,
  useTreeContext,
  useTreeNodeState,
} from "./TreeView";
import { type VisibleNode, selectFocused } from "./treeViewNode";

export interface VirtualTreeEntry<T> {
  node: T;
  indexPath: number[];
}

// Virtualized rows render flat, so nesting can't carry the depth down to them.
const depthStyleFor = (indexPath: number[]): CSSProperties & { "--tree-depth": number } => ({
  "--tree-depth": indexPath.length,
});

const stickyIndexOf = (
  nodes: readonly VisibleNode<unknown>[],
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
        data-pinned=""
        data-expanded=""
        borderBottomWidth="1px"
        borderColor="border"
        css={{ "--tree-row-bg": "var(--surface-bg, {colors.bg})" }}
        style={depthStyleFor(indexPath)}
        onClick={onActivate}
      >
        <FlatBranchIndicator data-expanded="">
          <ChevronRightIcon />
        </FlatBranchIndicator>
        {children}
      </FlatBranchControl>
    </Box>
  );
};

export interface VirtualTreeProps<T> extends Omit<ScrollAreaProps, "children"> {
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
 * The scrolling body of a tree that renders only the rows in view. Place it inside `TreeView.Tree`:
 * it shows every node of the enclosing `TreeView.Root` whose ancestors are all expanded, keyboard
 * navigation scrolls rows that aren't rendered into view, and the focused row keeps the tab stop
 * while it is scrolled away. Its rows' node type is `T`; annotate the render function's entry.
 */
export const VirtualTree = <T,>({
  rowHeight,
  stickyBranches = false,
  renderStickyBranch,
  children,
  ...scrollAreaProps
}: VirtualTreeProps<T>) => {
  const { tree, collection, visibleNodes, visibleValues, firstValue } = useTreeContext();
  const focusedValue = useStore(tree.store, selectFocused);
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);

  useLayoutEffect(() => {
    tree.setScroller((index) => scrollToIndexRef.current?.(index));
    return () => tree.setScroller(undefined);
  }, [tree]);

  const tabStopValue =
    focusedValue != null && visibleValues.has(focusedValue) ? focusedValue : firstValue;
  const tabStopIndex =
    tabStopValue == null ? -1 : visibleNodes.findIndex((entry) => entry.value === tabStopValue);

  const [stickyValue, setStickyValue] = useState<string | null>(null);
  const [stickyHeight, setStickyHeight] = useState<number>();
  const visibleItemsRef = useRef<VisibleItems | null>(null);
  const latest = useLatestRef(visibleNodes);

  // State holds only the pinned branch, so scrolling between its rows doesn't re-render the tree.
  const syncSticky = useCallback(() => {
    const nodes = latest.current;
    const index = visibleItemsRef.current ? stickyIndexOf(nodes, visibleItemsRef.current) : -1;
    setStickyValue(index < 0 ? null : nodes[index].value);
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
      ? visibleNodes.findIndex((entry) => entry.value === stickyValue)
      : -1;
  const stickyEntry = stickyIndex >= 0 ? visibleNodes[stickyIndex] : undefined;

  const getItemKey = useCallback((index: number) => visibleNodes[index].value, [visibleNodes]);

  const renderRow = useCallback(
    (entry: VisibleNode<unknown>) => (
      <TreeView.NodeProvider
        node={entry.node}
        indexPath={entry.indexPath}
      >
        {children(entry as VirtualTreeEntry<T>)}
      </TreeView.NodeProvider>
    ),
    [children],
  );

  return (
    <VirtualScrollArea
      items={visibleNodes as VisibleNode<unknown>[]}
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
              onActivate={() => tree.focus(stickyEntry.value)}
            >
              {renderStickyBranch?.(stickyEntry as VirtualTreeEntry<T>) ?? (
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
  const { collection, checkable } = useTreeContext();
  const state = useTreeNodeState();
  const { isBranch, expanded, disabled, indexPath } = state;

  return (
    <TreeDndRow
      isBranch={isBranch}
      role={isBranch ? "treeitem" : undefined}
      aria-expanded={isBranch ? expanded : undefined}
      aria-level={isBranch ? indexPath.length : undefined}
      aria-selected={isBranch && !disabled ? state.selected : undefined}
      aria-checked={isBranch && checkable ? ariaChecked(state.checked) : undefined}
      aria-setsize={collection.getSiblingNodes(indexPath).length}
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
