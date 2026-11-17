import { expect, test, vi } from "vitest";

import type { ColumnDef } from "./columns/types";
import { GridCore, type GridOptions } from "./grid";

interface Row {
  id: string;
  parent?: string;
}

const ROW = 36;
const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));

const grid = (options: Partial<GridOptions<Row, unknown>> = {}) => {
  const core = new GridCore<Row>({
    rows,
    getRowId: (row) => row.id,
    columnDefs: [{ id: "label", width: 100 }],
    ...options,
  });
  core.setViewport(800, 400);
  return core;
};

const rowY = (index: number, fraction: number) => ROW + ROW * index + ROW * fraction;

test("a leaf dragged past its column group's edge is clamped to that edge", () => {
  const columnDefs: ColumnDef<Row>[] = [
    {
      id: "g1",
      children: [
        { id: "a", width: 100 },
        { id: "b", width: 100 },
      ],
    },
    {
      id: "g2",
      children: [
        { id: "c", width: 100 },
        { id: "d", width: 100 },
      ],
    },
  ];
  const core = grid({ columnDefs, onColumnsDrop: () => {} });

  core.dnd.begin({ kind: "columns", id: "a" });
  core.dnd.hover(350, 10);

  expect(core.dnd.indicator).toEqual({ kind: "columns", id: "b", position: "after" });
});

test("dropping a row in the gap right after itself reports no drop", () => {
  const onRowsDrop = vi.fn();
  const core = grid({ onRowsDrop });

  core.dnd.begin({ kind: "rows", id: "3" });
  core.dnd.hover(10, rowY(4, 0.1));
  core.dnd.end(false);

  expect(onRowsDrop).not.toHaveBeenCalled();
});

test("where canDropOnto refuses, the middle third of a row is the nearest gap", () => {
  const core = grid({ onRowsDrop: () => {}, canDropOnto: (_, targetId) => targetId !== "5" });

  core.dnd.begin({ kind: "rows", id: "0" });
  core.dnd.hover(10, rowY(5, 0.55));

  expect(core.dnd.indicator).toEqual({ kind: "rows", id: "5", position: "after" });
});

test("where canDropBetween refuses, a row's top third drops onto it and a refused onto drops nothing", () => {
  const onRowsDrop = vi.fn();
  const core = grid({
    onRowsDrop,
    canDropOnto: (_, targetId) => targetId !== "6",
    canDropBetween: (source) => source.kind !== "rows",
  });

  core.dnd.begin({ kind: "rows", id: "0" });
  core.dnd.hover(10, rowY(5, 0.1));
  expect(core.dnd.indicator).toEqual({ kind: "rows", id: "5", position: "onto" });

  core.dnd.hover(10, rowY(6, 0.1));
  expect(core.dnd.indicator).toBeNull();
  core.dnd.end(false);
  expect(onRowsDrop).not.toHaveBeenCalled();
});

test("where canDropBetween refuses, Alt+Shift moves report no drop", () => {
  const onRowsDrop = vi.fn();
  const core = grid({ onRowsDrop, canDropBetween: () => false });
  core.setActiveCell({ row: 3, column: 0 });

  core.runCommand("moveRowsDown");

  expect(onRowsDrop).not.toHaveBeenCalled();
});

test("a hit test over a pinned top row reports the top region, not body row 0", () => {
  const core = grid({ pinnedTopRows: [{ id: "total" }] });

  expect(core.hitTest(10, ROW + 10)).toMatchObject({ region: "top", rowId: "total" });
});

test("moving an expanded parent down lands it after its next sibling, not among its children", () => {
  const onRowsDrop = vi.fn();
  const core = grid({
    rows: [{ id: "p1" }, { id: "c1", parent: "p1" }, { id: "c2", parent: "p1" }, { id: "p2" }],
    getParentId: (row) => row.parent,
    expandedRowIds: ["p1"],
    onRowsDrop,
  });
  core.setActiveCell({ row: 0, column: 0 });

  core.runCommand("moveRowsDown");

  expect(onRowsDrop).toHaveBeenCalledWith({ ids: ["p1"], targetId: "p2", position: "after" });
});
