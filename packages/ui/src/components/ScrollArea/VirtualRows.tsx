import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import type { ReactNode, Ref } from "react";

import { Box } from "#styled-system/jsx";

interface VirtualRowsProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  ref?: Ref<HTMLDivElement>;
  children: (virtualItem: VirtualItem) => ReactNode;
}

export function VirtualRows({ virtualizer, ref, children }: VirtualRowsProps) {
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
            ref={virtualizer.measureElement}
            style={gap > 0 ? { marginTop: `${gap}px` } : undefined}
          >
            {children(virtualItem)}
          </Box>
        );
      })}
    </Box>
  );
}
