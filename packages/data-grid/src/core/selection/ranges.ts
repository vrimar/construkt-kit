import type { CellSpan } from "../spans/spanIndex";
import type { CellPosition } from "./navigation";

export interface IndexRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const rectBetween = (a: CellPosition, b: CellPosition): IndexRect => ({
  top: Math.min(a.row, b.row),
  left: Math.min(a.column, b.column),
  bottom: Math.max(a.row, b.row),
  right: Math.max(a.column, b.column),
});

export const rectContains = (rect: IndexRect, { row, column }: CellPosition): boolean =>
  row >= rect.top && row <= rect.bottom && column >= rect.left && column <= rect.right;

export function expandToSpans(
  rect: IndexRect,
  spanAt: (row: number, column: number) => CellSpan,
): IndexRect {
  let { top, left, bottom, right } = rect;
  let changed = true;
  const include = (span: CellSpan) => {
    const spanBottom = span.row + span.rows - 1;
    const spanRight = span.column + span.columns - 1;
    if (span.row >= top && spanBottom <= bottom && span.column >= left && spanRight <= right)
      return;
    top = Math.min(top, span.row);
    bottom = Math.max(bottom, spanBottom);
    left = Math.min(left, span.column);
    right = Math.max(right, spanRight);
    changed = true;
  };
  while (changed) {
    changed = false;
    for (let column = left; column <= right; column++) {
      include(spanAt(top, column));
      include(spanAt(bottom, column));
    }
    for (let row = top + 1; row < bottom; row++) {
      include(spanAt(row, left));
      include(spanAt(row, right));
    }
  }
  return { top, left, bottom, right };
}

export interface BlockLayout {
  rows: number[];
  columns: number[];
}

const span = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, offset) => from + offset);

export const rectLayout = (rect: IndexRect): BlockLayout => ({
  rows: span(rect.top, rect.bottom),
  columns: span(rect.left, rect.right),
});

export function copyLayout(rects: readonly IndexRect[]): BlockLayout | null {
  if (rects.length === 0) return null;
  const [first] = rects;
  const union = (pick: (rect: IndexRect) => number[]) =>
    [...new Set(rects.flatMap(pick))].sort((a, b) => a - b);
  if (rects.every((rect) => rect.top === first.top && rect.bottom === first.bottom)) {
    return { rows: span(first.top, first.bottom), columns: union((r) => span(r.left, r.right)) };
  }
  if (rects.every((rect) => rect.left === first.left && rect.right === first.right)) {
    return { rows: union((r) => span(r.top, r.bottom)), columns: span(first.left, first.right) };
  }
  return null;
}
