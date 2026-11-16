import type { CellTone } from "../columns/types";
import type { RowId } from "../rows/rowNode";

export interface CellAddress {
  rowId: RowId;
  columnId: string;
}

export type GridTarget =
  | { kind: "cell"; rowId: RowId; columnId: string }
  | { kind: "header"; columnId: string };

/** Two corner cells; the grid widens the rectangle between them to cover any merge it cuts. */
export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

export type EntityKind = "rows" | "columns" | "groups";

/** Selected rows, leaf columns or column groups; one kind at a time. */
export type EntitySelection =
  | { kind: "rows"; ids: readonly RowId[] }
  | { kind: "columns" | "groups"; ids: readonly string[] };

export interface SelectionDetails {
  selection: EntitySelection | null;
  cellSelection: readonly CellRange[];
}

/** Summary of the selected values, skipping cells covered by a merge that starts inside the selection. */
export interface RangeStats {
  cellCount: number;
  /** Cells holding a value other than `null`, `undefined` or `""`. */
  count: number;
  /** Cells holding a finite number. */
  numericCount: number;
  sum: number;
  /** `null` when no cell holds a number, as are `min` and `max`. */
  average: number | null;
  min: number | null;
  max: number | null;
}

export const FLASH_MS = 900;

export interface FlashTargets {
  rows?: readonly RowId[];
  columns?: readonly string[];
  cells?: readonly CellAddress[];
  /** Colour of the flash. Defaults to `"brand"`. */
  kind?: CellTone;
}
