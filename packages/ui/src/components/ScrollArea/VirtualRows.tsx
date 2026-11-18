import type { Virtualizer } from "@tanstack/react-virtual";
import { type ReactNode, type Ref, memo, useEffect } from "react";

import { Box } from "#styled-system/jsx";

export type ScrollToIndexRef = { current: ((index: number) => void) | undefined };

/** Hands `ref` a function that scrolls `virtualizer` to an index, until unmount. */
export function useScrollToIndexRef(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  ref: ScrollToIndexRef | undefined,
) {
  useEffect(() => {
    if (!ref) return;
    ref.current = (index) => virtualizer.scrollToIndex(index);
    return () => {
      ref.current = undefined;
    };
  }, [virtualizer, ref]);
}

export type RenderVirtualItem<T> = (item: T, index: number) => ReactNode;

interface RowContentProps<T> {
  item: T;
  index: number;
  render: RenderVirtualItem<T>;
}

const RowContent = memo(function RowContent<T>({ item, index, render }: RowContentProps<T>) {
  return render(item, index);
}) as <T>(props: RowContentProps<T>) => ReactNode;

interface VirtualRowsProps<T> {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  items: readonly T[];
  ref?: Ref<HTMLDivElement>;
  measure?: boolean;
  /** Re-runs for a kept row only when its item, its index or this function changes. */
  children: RenderVirtualItem<T>;
}

export function VirtualRows<T>({
  virtualizer,
  items,
  ref,
  measure = true,
  children,
}: VirtualRowsProps<T>) {
  const { scrollMargin } = virtualizer.options;
  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start - scrollMargin : 0;
  // Item offsets include scrollMargin; getTotalSize() does not.
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() + scrollMargin - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <Box
      ref={ref}
      style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
    >
      {virtualItems.map((virtualItem, position) => {
        const gap = position > 0 ? virtualItem.start - virtualItems[position - 1].end : 0;
        return (
          <Box
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={measure ? virtualizer.measureElement : undefined}
            overflow={measure ? undefined : "hidden"}
            style={{
              marginTop: gap > 0 ? `${gap}px` : undefined,
              height: measure ? undefined : `${virtualItem.size}px`,
            }}
          >
            <RowContent
              item={items[virtualItem.index]}
              index={virtualItem.index}
              render={children}
            />
          </Box>
        );
      })}
    </Box>
  );
}
