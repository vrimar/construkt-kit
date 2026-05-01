import { Box } from "@construkt-kit/styled-system/jsx";
import { type VirtualItem, useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

import { ScrollArea, type ScrollAreaProps } from "./ScrollArea";

const isInlineSizeValue = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

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
  ...scrollAreaProps
}: VirtualScrollAreaProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { style, height, maxHeight, ...resolvedScrollAreaProps } = scrollAreaProps;

  const resolvedStyle = {
    ...style,
    ...(isInlineSizeValue(height) ? { height } : {}),
    ...(isInlineSizeValue(maxHeight) ? { maxHeight } : {}),
  };

  const resolvedHeightProps = {
    ...(isInlineSizeValue(height) ? {} : { height }),
    ...(isInlineSizeValue(maxHeight) ? {} : { maxHeight }),
  };

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    getItemKey,
    ...(measure ? {} : { measureElement: undefined }),
  });

  if (measure) {
    const virtualItems = virtualizer.getVirtualItems();
    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom =
      virtualItems.length > 0
        ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
        : 0;

    return (
      <ScrollArea
        ref={parentRef}
        {...resolvedScrollAreaProps}
        {...resolvedHeightProps}
        style={resolvedStyle}
      >
        {header}
        <Box style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
          {virtualItems.map((virtualItem) => (
            <Box
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
            >
              {children(items[virtualItem.index], virtualItem.index, virtualItem)}
            </Box>
          ))}
        </Box>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      ref={parentRef}
      {...resolvedScrollAreaProps}
      {...resolvedHeightProps}
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
