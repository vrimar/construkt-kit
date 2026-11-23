import { type Virtualizer, type VirtualizerOptions, useVirtualizer } from "@tanstack/react-virtual";
import { type Key, type ReactElement, useLayoutEffect, useState } from "react";

import {
  type RenderVirtualItem,
  type ScrollToIndexRef,
  VirtualRows,
  useScrollToIndexRef,
} from "./VirtualRows";

export interface UseVirtualListOptions<T> extends Pick<
  Partial<VirtualizerOptions<HTMLDivElement, Element>>,
  "rangeExtractor" | "observeElementOffset" | "onChange"
> {
  items: readonly T[];
  /** Returns the scroll area's viewport; a new function measures the list again. */
  getScrollElement: () => HTMLDivElement | null;
  /** Estimated height in pixels of the item at an index. */
  estimateSize: (index: number) => number;
  /** Measures each rendered row after render, for rows of varying height. @default true */
  measure?: boolean | undefined;
  /** Number of items to render outside the visible area. @default 10 */
  overscan?: number | undefined;
  getItemKey?: ((index: number) => Key) | undefined;
  /** Receives a function that scrolls an item into view by index; cleared on unmount. */
  scrollToIndexRef?: ScrollToIndexRef | undefined;
  /** Px past the viewport's top padding that an item scrolled into view stops below. @default 0 */
  scrollPaddingStart?: number | undefined;
  /**
   * Renders one item. A rendered item re-renders only when its item, its index or this function
   * changes.
   */
  renderItem: RenderVirtualItem<T>;
}

export interface UseVirtualListReturn {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  /** The rendered rows, to place in the viewport's content. */
  rows: ReactElement;
  /** The element the rows render in, once mounted. */
  listElement: HTMLDivElement | null;
}

interface ListInsets {
  offset: number;
  paddingTop: number;
  paddingBottom: number;
}

const NO_INSETS: ListInsets = { offset: 0, paddingTop: 0, paddingBottom: 0 };

const sameInsets = (a: ListInsets, b: ListInsets) =>
  a.offset === b.offset && a.paddingTop === b.paddingTop && a.paddingBottom === b.paddingBottom;

/**
 * Virtualizes `items` into rows inside a scroll area's viewport, offset by whatever precedes the
 * rows in its content. Items scrolled into view stop inside the viewport's padding.
 */
export function useVirtualList<T>({
  items,
  getScrollElement,
  measure = true,
  overscan = 10,
  scrollToIndexRef,
  scrollPaddingStart = 0,
  renderItem,
  ...options
}: UseVirtualListOptions<T>): UseVirtualListReturn {
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [insets, setInsets] = useState(NO_INSETS);

  // Measures the list's offset instead of wrapping what precedes it: a wrapper would confine a sticky header.
  useLayoutEffect(() => {
    const scrollElement = getScrollElement();
    const content = listElement?.parentElement;
    if (!scrollElement || !listElement || !content) return;
    const measureInsets = () => {
      const box = scrollElement.getBoundingClientRect();
      // Rects carry an opening animation's transform; scrollTop doesn't.
      const scale =
        box.height && scrollElement.offsetHeight ? box.height / scrollElement.offsetHeight : 1;
      const style = getComputedStyle(scrollElement);
      const next = {
        offset:
          (listElement.getBoundingClientRect().top - box.top) / scale -
          scrollElement.clientTop +
          scrollElement.scrollTop,
        paddingTop: Number.parseFloat(style.paddingTop) || 0,
        paddingBottom: Number.parseFloat(style.paddingBottom) || 0,
      };
      setInsets((current) => (sameInsets(current, next) ? current : next));
    };
    measureInsets();
    const observer = new ResizeObserver(measureInsets);
    observer.observe(content);
    return () => observer.disconnect();
  }, [getScrollElement, listElement]);

  const virtualizer = useVirtualizer<HTMLDivElement, Element>({
    ...options,
    count: items.length,
    overscan,
    getScrollElement,
    scrollMargin: insets.offset,
    scrollPaddingStart: insets.paddingTop + scrollPaddingStart,
    scrollPaddingEnd: insets.paddingBottom,
  });

  useScrollToIndexRef(virtualizer, scrollToIndexRef);

  const rows = (
    <VirtualRows
      ref={setListElement}
      virtualizer={virtualizer}
      items={items}
      measure={measure}
    >
      {renderItem}
    </VirtualRows>
  );

  return { virtualizer, rows, listElement };
}
