import type { RowId } from "../rows/rowNode";

export type HitRegion = "header" | "top" | "body" | "bottom";

export interface HitBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CoreHit {
  region: HitRegion;
  rowId: RowId | null;
  rowIndex: number;
  columnId: string | null;
  headerId: string | null;
  fractionX: number;
  fractionY: number;
  box: HitBox;
}
