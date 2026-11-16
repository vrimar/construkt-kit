import { expect, test } from "vitest";

import { encodeTsv } from "./clipboard/encode";
import type { ColumnDef } from "./columns/types";
import { GridCore } from "./grid";

interface Row {
  id: string;
  parent?: string;
}

const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
const grid = (
  columnDefs: ColumnDef<Row>[],
  extra: Partial<ConstructorParameters<typeof GridCore<Row>>[0]> = {},
) => new GridCore<Row>({ rows, getRowId: (row) => row.id, columnDefs, ...extra });

test("selecting a column clears the selected rows", () => {
  const core = grid([{ id: "a" }, { id: "b" }]);
  core.selection.select("rows", "3", "replace");

  core.selection.select("columns", "b", "replace");

  expect(core.selection.selection).toEqual({ kind: "columns", ids: ["b"] });
});

test("a shift range of columns skips hidden and non-selectable ones", () => {
  const core = grid([
    { id: "a" },
    { id: "hidden", hidden: true },
    { id: "fixed", selectable: false },
    { id: "d" },
  ]);
  core.selection.select("columns", "a", "replace");

  core.selection.select("columns", "d", "range");

  expect(core.selection.selection).toEqual({ kind: "columns", ids: ["a", "d"] });
});

test("a range widens over a chain of merges, each pulling in the next", () => {
  const starts: Record<string, Record<string, number>> = {
    left: { "0": 2, "2": 2 },
    right: { "1": 2, "3": 2 },
  };
  const core = grid(
    ["left", "right"].map((id) => ({ id, rowSpan: (row: Row) => starts[id][row.id] ?? 1 })),
  );

  core.selection.pressCell({ row: 0, column: 0 }, { extend: false, add: false });
  core.selection.dragTo({ row: 0, column: 1 });

  expect(core.selection.rangeRects()).toEqual([{ top: 0, left: 0, bottom: 4, right: 1 }]);
});

test("onSelectionEnd reports a drag's range while cellSelection is controlled", () => {
  const ended: unknown[] = [];
  const core = grid([{ id: "a" }, { id: "b" }], {
    cellSelection: [],
    onSelectionEnd: ({ cellSelection }) => ended.push(cellSelection),
  });

  core.selection.pressCell({ row: 0, column: 0 }, { extend: false, add: false });
  core.selection.dragTo({ row: 1, column: 1 });
  core.selection.releaseDrag();

  expect(ended).toEqual([
    [{ start: { rowId: "0", columnId: "a" }, end: { rowId: "1", columnId: "b" } }],
  ]);
});

test("TSV quotes a field holding a tab, a line break or a quote, doubling the quote", () => {
  expect(
    encodeTsv([
      ["plain", "a\tb"],
      ['say "hi"', "two\nlines"],
    ]),
  ).toBe('plain\t"a\tb"\n"say ""hi"""\t"two\nlines"');
});

test("two ranges sharing neither rows nor columns refuse to copy", () => {
  const core = grid([{ id: "a" }, { id: "b" }, { id: "c" }]);
  core.selection.pressCell({ row: 0, column: 0 }, { extend: false, add: false });
  core.selection.releaseDrag();

  core.selection.pressCell({ row: 2, column: 2 }, { extend: false, add: true });
  core.selection.releaseDrag();

  expect(core.selection.ranges).toHaveLength(2);
  expect(core.selection.copyCells()).toBeNull();
});

test("selecting a collapsed parent selects its children; deselecting one leaves the parent mixed", () => {
  const tree: Row[] = [{ id: "P" }, { id: "c1", parent: "P" }, { id: "c2", parent: "P" }];
  const core = new GridCore<Row>({
    rows: tree,
    getRowId: (row) => row.id,
    getParentId: (row) => row.parent,
    columnDefs: [{ id: "a" }],
  });

  core.selection.select("rows", "P", "toggle");
  expect(core.selection.selection).toEqual({ kind: "rows", ids: ["P", "c1", "c2"] });

  core.selection.select("rows", "c1", "toggle");
  expect(core.selection.selection).toEqual({ kind: "rows", ids: ["c2"] });
  expect(core.selection.rowState(core.nodeAt(0))).toBe("mixed");
});

test("unchecking a pinned row after select-all leaves the header mixed", () => {
  const core = grid([{ id: "a" }], { pinnedTopRows: [{ id: "total" }] });
  core.selection.selectAllRows(true);

  core.selection.select("rows", "total", "toggle");

  expect(core.selection.allRowsState()).toBe("mixed");
});

test("stats count a cell shared by two ranges once", () => {
  const at = (row: number, columnId: string) => ({ rowId: String(row), columnId });
  const core = grid([{ id: "a" }, { id: "b" }, { id: "c" }], {
    cellSelection: [
      { start: at(0, "a"), end: at(1, "b") },
      { start: at(1, "b"), end: at(2, "c") },
    ],
  });

  expect(core.selection.stats()?.cellCount).toBe(7);
});

test("select-all skips a full-width row hidden under a collapsed parent", () => {
  const tree: Row[] = [{ id: "P" }, { id: "F", parent: "P" }, { id: "c", parent: "P" }];
  const core = new GridCore<Row>({
    rows: tree,
    getRowId: (row) => row.id,
    getParentId: (row) => row.parent,
    isFullWidthRow: (row) => row.id === "F",
    columnDefs: [{ id: "a" }],
  });

  core.selection.selectAllRows(true);

  expect(core.selection.selection).toEqual({ kind: "rows", ids: ["P", "c"] });
});
