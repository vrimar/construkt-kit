import type { RowModel } from "../rows/rowModel";
import type { OffsetIndex } from "./offsetIndex";

export interface StickyRow {
  index: number;
  /** Offset from the top of the body viewport; negative while the next parent pushes it out. */
  top: number;
}

export function stickyParents(
  contentTop: number,
  rows: RowModel<unknown>,
  offsets: OffsetIndex,
): StickyRow[] {
  const stack: StickyRow[] = [];
  let slot = 0;
  for (;;) {
    const y = contentTop + slot;
    let ancestor = offsets.indexAt(y);
    if (ancestor < 0) break;
    while (ancestor >= 0 && rows.depthOf(ancestor) > stack.length)
      ancestor = rows.parentOf(ancestor);
    if (ancestor < 0 || rows.depthOf(ancestor) !== stack.length || !rows.isExpanded(ancestor))
      break;
    if (offsets.offsetOf(ancestor) >= y) break;
    const height = offsets.heightOf(ancestor);
    const end = offsets.offsetOf(rows.subtreeEnd(ancestor));
    const top = Math.min(slot, end - contentTop - height);
    stack.push({ index: ancestor, top });
    slot = top + height;
  }
  return stack;
}
