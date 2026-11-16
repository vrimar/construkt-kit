import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { type ReactNode, type Ref, useEffect } from "react";

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

interface VirtualRowsProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  ref?: Ref<HTMLDivElement>;
  measure?: boolean;
  children: (virtualItem: VirtualItem) => ReactNode;
}

export function VirtualRows({ virtualizer, ref, measure = true, children }: VirtualRowsProps) {
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
            {children(virtualItem)}
          </Box>
        );
      })}
    </Box>
  );
}
