import { type VirtualItem, useVirtualizer } from "@tanstack/react-virtual";
import { type Ref, useCallback, useRef } from "react";

import { Box } from "#styled-system/jsx";

import { splitInlineSizes } from "../../foundations/cssSize";
import { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
import { VirtualRows } from "./VirtualRows";

interface BaseProps<T> extends Omit<ScrollAreaProps, "children" | "ref"> {
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
}

interface FixedHeightProps<T> extends BaseProps<T> {
  /** When true, items are measured after render to support variable heights. */
  measure?: false;
}

interface MeasuredHeightProps<T> extends BaseProps<T> {
  /** When true, items are measured after render to support variable heights. */
  measure: true;
}

export type VirtualScrollAreaProps<T> = FixedHeightProps<T> | MeasuredHeightProps<T>;

export const VirtualScrollArea = <T,>({
  items,
  itemHeight,
  overscan = 10,
  children,
  getItemKey,
  measure,
  header,
  viewportRef,
  ...scrollAreaProps
}: VirtualScrollAreaProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { style, ...sizedScrollAreaProps } = scrollAreaProps;
  const [sizeStyle, resolvedScrollAreaProps] = splitInlineSizes(sizedScrollAreaProps, [
    "height",
    "maxHeight",
  ]);
  const resolvedStyle = { ...style, ...sizeStyle };

  // Read viewportRef through a ref so an inline-arrow prop can't churn setViewport's identity
  // (which would detach/reattach the scroll element the virtualizer reads every commit).
  const viewportRefProp = useRef(viewportRef);
  viewportRefProp.current = viewportRef;

  const setViewport = useCallback((element: HTMLDivElement | null) => {
    parentRef.current = element;
    const consumer = viewportRefProp.current;
    if (typeof consumer === "function") consumer(element);
    else if (consumer) consumer.current = element;
  }, []);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    getItemKey,
  });

  if (measure) {
    return (
      <ScrollArea
        ref={setViewport}
        {...resolvedScrollAreaProps}
        style={resolvedStyle}
      >
        {header}
        <VirtualRows virtualizer={virtualizer}>
          {(virtualItem) => children(items[virtualItem.index], virtualItem.index, virtualItem)}
        </VirtualRows>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      ref={setViewport}
      {...resolvedScrollAreaProps}
      style={resolvedStyle}
    >
      {header}
      <Box
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
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {children(items[virtualItem.index], virtualItem.index, virtualItem)}
          </Box>
        ))}
      </Box>
    </ScrollArea>
  );
};
