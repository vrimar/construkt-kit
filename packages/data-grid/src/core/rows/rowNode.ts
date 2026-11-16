export type RowId = string | number;

export interface RowNode<TRow> {
  readonly id: RowId;
  data: TRow;
  index: number;
  version: number;
}
