import type { ColumnDef, DropPosition, RowId } from "../src";

export interface FixtureRow {
  id: number;
}

export function createFixture(rowCount: number, columnCount: number, { width = 120 } = {}) {
  const rows: FixtureRow[] = Array.from({ length: rowCount }, (_, id) => ({ id }));
  const columnDefs: ColumnDef<FixtureRow>[] = Array.from({ length: columnCount }, (_, column) => ({
    id: `c${column}`,
    header: `Column ${column + 1}`,
    width,
    getValue: (row) => `R${row.id + 1}C${column + 1}`,
  }));
  return { rows, columnDefs, getRowId: (row: FixtureRow) => row.id };
}

export function moveIds<T>(
  items: readonly T[],
  idOf: (item: T) => RowId,
  ids: readonly RowId[],
  targetId: RowId,
  position: Exclude<DropPosition, "onto">,
): T[] {
  const moving = items.filter((item) => ids.includes(idOf(item)));
  const rest = items.filter((item) => !ids.includes(idOf(item)));
  const index = rest.findIndex((item) => idOf(item) === targetId);
  rest.splice(position === "before" ? index : index + 1, 0, ...moving);
  return rest;
}
