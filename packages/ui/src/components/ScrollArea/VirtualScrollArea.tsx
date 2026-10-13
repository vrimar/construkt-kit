import {
  type Range,
  type VirtualItem,
  defaultRangeExtractor,
  useVirtualizer,
} from "@tanstack/react-virtual";
import {
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Box } from "#styled-system/jsx";

import { splitInlineSizes } from "../../foundations/cssSize";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
import { VirtualRows } from "./VirtualRows";

export interface VirtualScrollAreaProps<T> extends Omit<ScrollAreaProps, "children" | "ref"> {
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
  /** Content rendered before the virtualized list, inside the scroll container. */
  header?: React.ReactNode;
  /** Ref to the scroll viewport element (e.g. for drag auto-scroll). */
  viewportRef?: Ref<HTMLDivElement>;
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
  scrollToIndexRef?: RefObject<((index: number) => void) | undefined>;
}

export const VirtualScrollArea = <T,>({
  items,
  itemHeight,
  overscan = 10,
  children,
  getItemKey,
  measure,
  header,
  viewportRef,
  keepMountedIndex,
  scrollToIndexRef,
  ...scrollAreaProps
}: VirtualScrollAreaProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { style, ...sizedScrollAreaProps } = scrollAreaProps;
  const [sizeStyle, resolvedScrollAreaProps] = splitInlineSizes(sizedScrollAreaProps, [
    "height",
    "maxHeight",
  ]);
  const resolvedStyle = { ...style, ...sizeStyle };

  const setViewport = useComposedRefs(parentRef, viewportRef);

  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Measures the list's offset instead of wrapping `header`: a wrapper would confine a sticky header.
  useLayoutEffect(() => {
    const viewport = parentRef.current;
    const content = listElement?.parentElement;
    if (!viewport || !listElement || !content) return;
    const measureScrollMargin = () =>
      setScrollMargin(
        listElement.getBoundingClientRect().top -
          viewport.getBoundingClientRect().top -
          viewport.clientTop +
          viewport.scrollTop,
      );
    measureScrollMargin();
    const observer = new ResizeObserver(measureScrollMargin);
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

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    getItemKey,
    rangeExtractor,
    scrollMargin,
    scrollPaddingStart: scrollMargin,
  });

  const fixedItemHeight = typeof itemHeight === "number" ? itemHeight : undefined;
  const measuredItemHeightRef = useRef(fixedItemHeight);
  useEffect(() => {
    if (measuredItemHeightRef.current === fixedItemHeight) return;
    measuredItemHeightRef.current = fixedItemHeight;
    virtualizer.measure();
  }, [virtualizer, fixedItemHeight]);

  useEffect(() => {
    if (!scrollToIndexRef) return;
    scrollToIndexRef.current = (index) => virtualizer.scrollToIndex(index);
    return () => {
      scrollToIndexRef.current = undefined;
    };
  }, [virtualizer, scrollToIndexRef]);

  const renderItem = (virtualItem: VirtualItem) =>
    children(items[virtualItem.index], virtualItem.index, virtualItem);

  return (
    <ScrollArea
      ref={setViewport}
      {...resolvedScrollAreaProps}
      style={resolvedStyle}
    >
      {header}
      {measure ? (
        <VirtualRows
          ref={setListElement}
          virtualizer={virtualizer}
        >
          {renderItem}
        </VirtualRows>
      ) : (
        <Box
          ref={setListElement}
          width="100%"
          style={{ height: virtualizer.getTotalSize(), position: "relative" }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <Box
              key={virtualItem.key}
              overflow="hidden"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              }}
            >
              {renderItem(virtualItem)}
            </Box>
          ))}
        </Box>
      )}
    </ScrollArea>
  );
};
