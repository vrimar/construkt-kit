import { expect, test } from "vitest";

import type { ColumnDef } from "./columns/types";
import { GRID_CHANNELS, GridCore } from "./grid";

interface Row {
  id: number;
}

const rows: Row[] = Array.from({ length: 1000 }, (_, id) => ({ id }));
const columnDefs: ColumnDef<Row>[] = Array.from({ length: 20 }, (_, i) => ({ id: `c${i}` }));

test("50 scroll events inside the rendered range notify the window zero times", () => {
  const grid = new GridCore<Row>({ rows, getRowId: (row) => row.id, columnDefs });
  grid.setViewport(800, 600);
  grid.setScroll(10_000, 0);
  let notified = 0;
  grid.channels.subscribe(GRID_CHANNELS.window, () => notified++);

  for (let step = 1; step <= 50; step++) grid.setScroll(10_000 + step * 2, 0);

  expect(notified).toBe(0);
});

test("getCell overrides column.cell, which overrides defaultCell", () => {
  const grid = new GridCore<Row>({
    rows,
    getRowId: (row) => row.id,
    columnDefs: [{ id: "plain" }, { id: "toned", cell: { tone: "info" } }],
    defaultCell: { tone: "neutral" },
    getCell: ({ rowIndex, columnId }) =>
      rowIndex === 0 && columnId === "toned" ? { tone: "danger" } : undefined,
  });

  expect(grid.resolveCell(0, 1).spec.tone).toBe("danger");
  expect(grid.resolveCell(1, 1).spec.tone).toBe("info");
  expect(grid.resolveCell(1, 0).spec.tone).toBe("neutral");
});

const groupedColumns: ColumnDef<Row>[] = [
  {
    id: "group",
    children: [
      { id: "wide", width: 300, minWidth: 50 },
      { id: "narrow", width: 100, minWidth: 80 },
    ],
  },
  { id: "other" },
];

test("resizing a group shares the delta across its columns and stops each at its min", () => {
  const grid = new GridCore<Row>({ rows, getRowId: (row) => row.id, columnDefs: groupedColumns });

  expect(grid.columns.resizedWidths("group", -150)).toEqual({ wide: 170, narrow: 80 });
});

test("pinning one column pins its whole top-level group", () => {
  const grid = new GridCore<Row>({ rows, getRowId: (row) => row.id, columnDefs: groupedColumns });
  grid.setViewport(1200, 600);

  grid.setColumnPinned("narrow", "left");

  const regions = Object.fromEntries(grid.columns.leaves.map((leaf) => [leaf.id, leaf.region]));
  expect(regions).toEqual({ wide: "left", narrow: "left", other: "center" });
});
