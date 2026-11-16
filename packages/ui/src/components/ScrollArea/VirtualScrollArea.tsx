import {
  type Range,
  type VirtualItem,
  type Virtualizer,
  defaultRangeExtractor,
  observeElementOffset,
  useVirtualizer,
} from "@tanstack/react-virtual";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
import { type ScrollToIndexRef, VirtualRows, useScrollToIndexRef } from "./VirtualRows";

export interface VirtualScrollAreaProps<T> extends Omit<ScrollAreaProps, "children"> {
  /** The list of items to virtualize. */
  items: T[];
  /** Estimated height in pixels for each item, or a function returning the height for a given index. */
  itemHeight: number | ((index: number) => number);
  /** Number of items to render outside the visible area. @default 10 */
  overscan?: number;
  /** Render function for each virtual item. */
  children: (item: T, index: number, virtualItem: VirtualItem) => React.ReactNode;
  /** Key extractor. Defaults to the index. */
  getItemKey?: (index: number) => React.Key;
  /**
   * Content rendered before the virtualized list, inside the scroll container. A sticky header
   * needs a `zIndex`, since the rows come after it.
   */
  header?: React.ReactNode;
  /** When true, items are measured after render to support variable heights. @default false */
  measure?: boolean;
  /**
   * Index of an item to keep rendered while it is scrolled out of view, such as the row holding
   * focus, so focus and its tab stop survive scrolling.
   */
  keepMountedIndex?: number;
  /**
   * Receives a function that scrolls an item into view by index (e.g. for keyboard navigation
   * past the rendered window); cleared on unmount.
   */
  scrollToIndexRef?: ScrollToIndexRef;
  /**
   * Called as the list scrolls with `firstVisible`, the first item at least partly in view below a
   * sticky `header` and `scrollPaddingStart`, and `firstUncut`, the first item whose top edge is in
   * view; each is -1 when there is none.
   */
  onVisibleItemsChange?: (items: VisibleItems) => void;
  /**
   * Px at the top of the viewport that an overlaying sticky header covers: items scrolled into
   * view, by this list or by the browser, stop below it, and `firstVisible` skips items hidden
   * under it. @default 0
   */
  scrollPaddingStart?: number;
}

export interface VisibleItems {
  firstVisible: number;
  firstUncut: number;
}

const findVisibleItems = (
  instance: Virtualizer<HTMLDivElement, Element>,
  coveredStart: number,
): VisibleItems => {
  const offset = instance.scrollOffset ?? 0;
  const items = instance.getVirtualItems();
  return {
    firstVisible: items.find((item) => item.end > offset + coveredStart)?.index ?? -1,
    firstUncut: items.find((item) => item.start >= offset)?.index ?? -1,
  };
};

export const VirtualScrollArea = <T,>({
  ref,
  items,
  itemHeight,
  overscan = 10,
  children,
  getItemKey,
  measure = false,
  header,
  keepMountedIndex,
  scrollToIndexRef,
  onVisibleItemsChange,
  scrollPaddingStart = 0,
  ...scrollAreaProps
}: VirtualScrollAreaProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const setViewport = useComposedRefs(parentRef, ref);

  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);

  // Measures the list's offset instead of wrapping `header`: a wrapper would confine a sticky header.
  useLayoutEffect(() => {
    const viewport = parentRef.current;
    const content = listElement?.parentElement;
    if (!viewport || !listElement || !content) return;
    const measureHeader = () => {
      setScrollMargin(
        listElement.getBoundingClientRect().top -
          viewport.getBoundingClientRect().top -
          viewport.clientTop +
          viewport.scrollTop,
      );
      let stickyHeight = 0;
      for (let el = listElement.previousElementSibling; el; el = el.previousElementSibling) {
        if (getComputedStyle(el).position === "sticky") {
          stickyHeight += el.getBoundingClientRect().height;
        }
      }
      setStickyHeaderHeight(stickyHeight);
    };
    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    observer.observe(content);
    return () => observer.disconnect();
  }, [listElement]);

  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range);
      if (
        keepMountedIndex === undefined ||
        keepMountedIndex < 0 ||
        keepMountedIndex >= range.count ||
        indexes.includes(keepMountedIndex)
      ) {
        return indexes;
      }
      return keepMountedIndex < indexes[0]
        ? [keepMountedIndex, ...indexes]
        : [...indexes, keepMountedIndex];
    },
    [keepMountedIndex],
  );

  const coveredStart = stickyHeaderHeight + scrollPaddingStart;
  const visibleItemsRef = useLatestRef({ onVisibleItemsChange, coveredStart });

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    getItemKey,
    rangeExtractor,
    scrollMargin,
    scrollPaddingStart: coveredStart,
    // onChange only fires when the rendered range changes; firstVisible moves with every offset.
    observeElementOffset: (instance, onOffset) =>
      observeElementOffset(instance, (offset, isScrolling) => {
        onOffset(offset, isScrolling);
        const latest = visibleItemsRef.current;
        latest.onVisibleItemsChange?.(findVisibleItems(instance, latest.coveredStart));
      }),
    onChange: (instance) => onVisibleItemsChange?.(findVisibleItems(instance, coveredStart)),
  });

  useLayoutEffect(() => {
    onVisibleItemsChange?.(findVisibleItems(virtualizer, coveredStart));
  }, [onVisibleItemsChange, coveredStart, virtualizer]);

  useLayoutEffect(() => {
    const viewport = parentRef.current;
    if (viewport) viewport.style.scrollPaddingTop = coveredStart ? `${coveredStart}px` : "";
  }, [coveredStart]);

  const fixedItemHeight = typeof itemHeight === "number" ? itemHeight : undefined;
  const measuredItemHeightRef = useRef(fixedItemHeight);
  useEffect(() => {
    if (measuredItemHeightRef.current === fixedItemHeight) return;
    measuredItemHeightRef.current = fixedItemHeight;
    virtualizer.measure();
    // measureElement compares against measurements that stay stale until read.
    virtualizer.getVirtualItems();
    // measure() drops real row sizes too; a mounted row that doesn't resize is never re-measured.
    virtualizer.elementsCache.forEach((element) => virtualizer.measureElement(element));
  }, [virtualizer, fixedItemHeight]);

  useScrollToIndexRef(virtualizer, scrollToIndexRef);

  return (
    <ScrollArea
      ref={setViewport}
      {...scrollAreaProps}
    >
      {header}
      <VirtualRows
        ref={setListElement}
        virtualizer={virtualizer}
        measure={measure}
      >
        {(virtualItem) => children(items[virtualItem.index], virtualItem.index, virtualItem)}
      </VirtualRows>
    </ScrollArea>
  );
};
