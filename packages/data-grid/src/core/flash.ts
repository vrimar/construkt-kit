import type { CellTone } from "./columns/types";
import type { RowId } from "./rows/rowNode";
import type { CellAddress } from "./selection/types";

export const FLASH_MS = 900;

export interface FlashTargets {
  rows?: readonly RowId[];
  columns?: readonly string[];
  cells?: readonly CellAddress[];
  /** Colour of the flash. Defaults to `"brand"`. */
  kind?: CellTone;
}

export interface Flash {
  id: number;
  rows: readonly RowId[];
  columns: readonly string[];
  cells: readonly CellAddress[];
  kind: CellTone;
}
