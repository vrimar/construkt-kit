import { act } from "@testing-library/react";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { commands } from "vitest/browser";

import { cellOf, headerOf, mountGrid } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { nextFrame, settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import { resizeHandleSelector } from "./dom";
import type { DataGridApi } from "./types";

test("with headerHeight 100, scrollToCell lands the row below the header", async () => {
  const apiRef = createRef<DataGridApi>();
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...createFixture(1000, 4)}
      headerHeight={100}
      apiRef={apiRef}
      aria-label="Tall header"
      style={{ width: 800, height: 500 }}
    />,
  );

  act(() => apiRef.current?.scrollToCell({ rowId: 500, columnId: "c0" }));
  await settle();

  const box = scroller.getBoundingClientRect();
  const row = cellOf(container, 500, 0).getBoundingClientRect();
  expect(row.top).toBeGreaterThanOrEqual(box.top + 100);
  expect(row.bottom).toBeLessThanOrEqual(box.top + scroller.clientHeight);
});

test("a pinned column stays on top of scrolled cells", async () => {
  const fixture = createFixture(100, 30);
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      columnPinning={{ c0: "left" }}
      aria-label="Pinned"
      style={{ width: 800, height: 500 }}
    />,
  );

  scroller.scrollLeft = 600;
  await settle();

  const pinned = cellOf(container, 3, 0).getBoundingClientRect();
  const hit = document.elementFromPoint(
    pinned.left + pinned.width / 2,
    pinned.top + pinned.height / 2,
  );
  expect(hit?.closest("[data-col-index]")?.getAttribute("data-col-index")).toBe("0");
});

test("a header spanning both header levels takes the pointer along its whole height", async () => {
  const { container } = await mountGrid(
    <DataGrid
      rows={[{ id: 1 }]}
      getRowId={(row) => row.id}
      columnDefs={[
        { id: "label", header: "Label", pinned: "left" },
        { id: "group", header: "Group", children: [{ id: "a" }, { id: "b" }] },
      ]}
      aria-label="Levels"
      style={{ width: 800, height: 300 }}
    />,
  );
  const header = headerOf(container, "label");
  const box = header.getBoundingClientRect();

  expect(header.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 4))).toBe(
    true,
  );
});

test("a resize drag moves later header and body cells live and commits once on release", async () => {
  const onColumnSizingChange = vi.fn();
  const { container } = await mountGrid(
    <DataGrid
      {...createFixture(20, 6)}
      onColumnSizingChange={onColumnSizingChange}
      aria-label="Resizable"
      style={{ width: 900, height: 400 }}
    />,
  );
  const laterHeader = () => headerOf(container, "c2").getBoundingClientRect().left;
  const laterCell = () => cellOf(container, 0, 2).getBoundingClientRect().left;
  const headerBefore = laterHeader();
  const cellBefore = laterCell();

  await commands.pressOn(resizeHandleSelector("c1"));
  await commands.moveBy(60, 0);
  await nextFrame();

  const moved = laterHeader() - headerBefore;
  expect(moved).toBeGreaterThan(30);
  expect(laterCell() - cellBefore).toBeCloseTo(moved, 0);
  expect(onColumnSizingChange).not.toHaveBeenCalled();

  await commands.release();
  expect(onColumnSizingChange).toHaveBeenCalledTimes(1);
  expect(onColumnSizingChange).toHaveBeenCalledWith({ c1: 120 + Math.round(moved) });
});

test("a resize drag released back at its start width commits nothing", async () => {
  const onColumnSizingChange = vi.fn();
  await mountGrid(
    <DataGrid
      {...createFixture(20, 6)}
      onColumnSizingChange={onColumnSizingChange}
      aria-label="Unchanged"
      style={{ width: 900, height: 400 }}
    />,
  );

  await commands.pressOn(resizeHandleSelector("c1"));
  await commands.moveBy(40, 0);
  await commands.moveBy(-40, 0);
  await commands.release();

  expect(onColumnSizingChange).not.toHaveBeenCalled();
});

test("a shrinking resize drag renders the columns it pulls into view", async () => {
  const fixture = createFixture(20, 16);
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      columnDefs={[
        { id: "group", header: "Group", children: fixture.columnDefs.slice(0, 6) },
        ...fixture.columnDefs.slice(6),
      ]}
      aria-label="Shrinking"
      style={{ width: 900, height: 400 }}
    />,
  );
  const box = scroller.getBoundingClientRect();

  await commands.pressOn(resizeHandleSelector("group"));
  await commands.moveBy(-480, 0);
  await nextFrame();
  const row = cellOf(container, 0, 6).getBoundingClientRect();
  const hit = document.elementFromPoint(box.right - 40, row.top + row.height / 2);
  await commands.release();

  expect(hit?.closest("[data-col-index]")).not.toBeNull();
});

test("a group's label stays in view while its columns are scrolled partly out", async () => {
  const fixture = createFixture(20, 12);
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      columnDefs={[
        fixture.columnDefs[0],
        { id: "group", header: "Wide group", children: fixture.columnDefs.slice(1) },
      ]}
      columnPinning={{ c0: "left" }}
      aria-label="Grouped"
      style={{ width: 600, height: 300 }}
    />,
  );

  scroller.scrollLeft = 400;
  await settle();

  const label = headerOf(container, "group").firstElementChild?.getBoundingClientRect();
  const pinnedRight = cellOf(container, 0, 0).getBoundingClientRect().right;
  expect(label?.left).toBeGreaterThanOrEqual(pinnedRight);
  expect(label?.right).toBeLessThanOrEqual(scroller.getBoundingClientRect().right);
});
