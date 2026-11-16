import { expect, test } from "vitest";

import type { ColumnDef } from "./columns/types";
import { GridCore } from "./grid";

interface Item {
  id: string;
  parent?: string;
  group?: string;
  banner?: boolean;
}

const CHILDREN = 12;

const tree = (): Item[] => [
  { id: "A" },
  ...Array.from({ length: CHILDREN }, (_, i) => ({ id: `a${i}`, parent: "A" })),
  { id: "B" },
  ...Array.from({ length: CHILDREN }, (_, i) => ({ id: `b${i}`, parent: "B" })),
];

const treeGrid = (rows = tree()) =>
  new GridCore<Item>({
    rows,
    getRowId: (row) => row.id,
    getParentId: (row) => row.parent,
    columnDefs: [{ id: "label", rowHeader: true }],
    defaultExpandedRowIds: ["A", "B"],
  });

test("expansion survives a new rows array", () => {
  const grid = treeGrid();
  grid.setRowExpanded("B", false);

  grid.setOptions({
    rows: tree(),
    getRowId: (row) => row.id,
    getParentId: (row) => row.parent,
    columnDefs: [{ id: "label", rowHeader: true }],
  });

  expect(grid.rowModel.isExpanded(grid.rowModel.indexOf("A"))).toBe(true);
  expect(grid.rowModel.indexOf("b0")).toBe(-1);
  expect(grid.rowCount).toBe(CHILDREN + 2);
});

test("a sticky parent is pushed up by the next parent", () => {
  const grid = treeGrid();
  grid.setViewport(800, 150);
  const rowHeight = grid.rowHeight(0);
  const subtreeEnd = (CHILDREN + 1) * rowHeight;

  grid.setScroll(subtreeEnd - rowHeight + 10, 0);

  expect(grid.stickyRows).toEqual([{ index: 0, top: -10 }]);
});

test("the visible range starts at the parent covering the top edge", () => {
  const grid = treeGrid();
  grid.setViewport(800, 150);

  grid.setScroll(grid.rowHeight(0) * (CHILDREN + 1 + 8), 0);

  expect(grid.visibleRange?.firstRowId).toBe("B");
});

const flat = Array.from({ length: 1000 }, (_, i) => ({ id: String(i) }));

test("a rowSpan anchored above the window keeps its anchor row mounted", () => {
  const columnDefs: ColumnDef<Item>[] = [
    { id: "merged", rowSpan: (row) => (row.id === "3" ? 50 : 1) },
    { id: "other" },
  ];
  const grid = new GridCore<Item>({ rows: flat, getRowId: (row) => row.id, columnDefs });
  grid.setViewport(800, 600);

  grid.setScroll(grid.rowHeight(0) * 30, 0);

  const rendered = grid.renderedRows();
  expect(rendered).toContain(3);
  expect(rendered).not.toContain(4);
});

test("a colSpan reaching past the left-pinned region is clipped at its edge", () => {
  const grid = new GridCore<Item>({
    rows: flat,
    getRowId: (row) => row.id,
    columnDefs: [
      { id: "wide", pinned: "left", colSpan: () => 5 },
      { id: "pinned", pinned: "left" },
      { id: "center" },
      { id: "more" },
    ],
  });
  grid.setViewport(1200, 600);

  expect(grid.spans.spanAt(0, 0).columns).toBe(2);
});

test("a rowSpan stops at a full-width row", () => {
  const rows = flat.slice(0, 20).map((row) => ({ ...row, banner: row.id === "5" }));
  const grid = new GridCore<Item>({
    rows,
    getRowId: (row) => row.id,
    isFullWidthRow: (row) => row.banner === true,
    columnDefs: [{ id: "merged", rowSpan: (row) => (row.id === "2" ? 10 : 1) }],
  });

  expect(grid.spans.spanAt(2, 0).rows).toBe(3);
});

test("a merge starting inside a 2-D merge leaves the rows below that merge to their own run", () => {
  const rows = flat.slice(0, 10).map((row) => ({
    ...row,
    group: ["1", "2", "3", "4"].includes(row.id) ? "same" : row.id,
  }));
  const grid = new GridCore<Item>({
    rows,
    getRowId: (row) => row.id,
    columnDefs: [
      {
        id: "block",
        rowSpan: (row) => (row.id === "0" ? 3 : 1),
        colSpan: (row) => (row.id === "0" ? 2 : 1),
      },
      { id: "group", field: "group", rowSpan: "sameValue" },
    ],
  });

  expect(grid.spans.spanAt(3, 1)).toEqual({ row: 3, column: 1, rows: 2, columns: 1 });
});

test("a colSpan stops before a column merged from a row above", () => {
  const grid = new GridCore<Item>({
    rows: flat,
    getRowId: (row) => row.id,
    columnDefs: [
      { id: "wide", colSpan: (row) => (row.id === "2" ? 3 : 1) },
      { id: "merged", rowSpan: (row) => (row.id === "1" ? 3 : 1) },
      { id: "other" },
    ],
  });

  expect(grid.spans.spanAt(2, 0).columns).toBe(1);
});
