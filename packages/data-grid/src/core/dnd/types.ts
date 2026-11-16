import type { RowId } from "../rows/rowNode";

/** Where a drop lands relative to its target: in the gap before or after it, or onto it. */
export type DropPosition = "before" | "after" | "onto";

/** What a grip drags: rows, or columns and column groups. */
export type DragSource =
  | { kind: "rows"; ids: readonly RowId[] }
  | { kind: "columns"; ids: readonly string[] };

export type DragItem = { kind: "rows"; id: RowId } | { kind: "columns"; id: string };

/** A marker the grid draws: a line in the gap before or after the target, or a box onto it. */
export type DropIndicator =
  | { kind: "rows"; id: RowId; position: DropPosition }
  | { kind: "columns"; id: string; position: DropPosition };

export interface RowsDrop {
  /** Dragged row ids in display order; siblings of one parent. */
  ids: readonly RowId[];
  targetId: RowId;
  position: DropPosition;
}

export interface ColumnsDrop {
  /** Dragged column or group ids, left to right; siblings in one group and pinned region. */
  ids: readonly string[];
  targetId: string;
  position: DropPosition;
}

export interface DragHandleEvent {
  readonly button: number;
  readonly pointerType: string;
  preventDefault(): void;
  stopPropagation(): void;
}

/** Spread onto a grip element: dragging it reorders its row, column or group. */
export interface DragHandleProps {
  className: string;
  "aria-hidden": true;
  "data-drag-handle": "";
  onPointerDown: (event: DragHandleEvent) => void;
}

export interface DragHandles {
  className: string;
  press: (item: DragItem, event: DragHandleEvent) => void;
}
