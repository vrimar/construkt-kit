import { type VirtualItem, useVirtualizer } from "@tanstack/react-virtual";
import { type Ref, useRef } from "react";

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

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === "function" ? itemHeight : () => itemHeight,
    overscan,
    getItemKey,
  });

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
        <VirtualRows virtualizer={virtualizer}>{renderItem}</VirtualRows>
      ) : (
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
              {renderItem(virtualItem)}
            </Box>
          ))}
        </Box>
      )}
    </ScrollArea>
  );
};
