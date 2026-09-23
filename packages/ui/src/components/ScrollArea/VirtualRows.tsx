import { Box } from "@construkt-kit/styled-system/jsx";
import type { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import type { ReactNode } from "react";

interface VirtualRowsProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  children: (virtualItem: VirtualItem) => ReactNode;
}

export function VirtualRows({ virtualizer, children }: VirtualRowsProps) {
  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <Box style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      {virtualItems.map((virtualItem) => (
        <Box
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
        >
          {children(virtualItem)}
        </Box>
      ))}
    </Box>
  );
}
