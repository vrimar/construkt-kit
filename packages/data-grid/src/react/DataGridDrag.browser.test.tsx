import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";

import { cellOf, rowHeight, rowOf, scrollerOf } from "../../test/dom";
import { type FixtureRow, createFixture } from "../../test/fixture";
import { frames, nextFrame, settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import type { DataGridApi, DataGridProps, ExternalDragEvent, RowId } from "./types";

async function renderColumnGrips(props: Partial<DataGridProps<FixtureRow>> = {}) {
  const fixture = createFixture(20, 4);
  const onColumnsDrop = vi.fn();
  const { container } = render(
    <DataGrid
      {...fixture}
      columnDefs={fixture.columnDefs.map((def) => ({
        ...def,
        rowHeader: def.id === "c2",
        header: (ctx) => (
          <>
            {ctx.dragHandleProps && <span {...ctx.dragHandleProps}>⠿</span>}
            {String(def.header)}
          </>
        ),
      }))}
      onColumnsDrop={onColumnsDrop}
      aria-label="Column grips"
      style={{ width: 800, height: 400 }}
      {...props}
    />,
  );
  await settle();
  return { container, onColumnsDrop };
}

async function pressGripAndMoveTo(container: HTMLElement, columnId: string, target: Element) {
  const selector = `[data-header-id="${columnId}"] [data-drag-handle]`;
  const grip = (container.querySelector(selector) as HTMLElement).getBoundingClientRect();
  const to = target.getBoundingClientRect();
  await commands.pressOn(selector);
  await commands.moveBy(
    to.left + to.width * 0.75 - (grip.left + grip.width / 2),
    to.top + to.height / 2 - (grip.top + grip.height / 2),
  );
  await nextFrame();
}

const headerOf = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-header-id="${id}"]`) as HTMLElement;

test("dragging a row's grip into the lower third of another row drops it after that row", async () => {
  const fixture = createFixture(20, 3);
  const onRowsDrop = vi.fn();
  const { container } = render(
    <div style={{ paddingTop: 150, paddingLeft: 40 }}>
      <DataGrid
        {...fixture}
        columnDefs={[
          {
            ...fixture.columnDefs[0],
            rowHeader: true,
            cell: {
              render: (ctx) => (
                <>
                  {ctx.dragHandleProps && <span {...ctx.dragHandleProps}>⠿</span>}
                  {ctx.formattedValue}
                </>
              ),
            },
          },
          ...fixture.columnDefs.slice(1),
        ]}
        onRowsDrop={onRowsDrop}
        aria-label="Reorder"
        style={{ width: 800, height: 500 }}
      />
    </div>,
  );
  await settle();

  await commands.pressOn('[data-row-index="1"] [data-drag-handle]');
  await commands.moveBy(0, rowHeight(container) * 2.4);
  await nextFrame();
  await commands.release();

  expect(onRowsDrop).toHaveBeenCalledTimes(1);
  expect(onRowsDrop.mock.calls[0][0]).toMatchObject({ ids: [1], targetId: 3, position: "after" });
});

test("onDragMove reports the placement within the axis, then across over a row header, then null on release", async () => {
  const onDragMove = vi.fn();
  const { container } = await renderColumnGrips({ onDragMove, canDropAcross: () => true });
  const source = { kind: "columns", ids: ["c0"] };

  await pressGripAndMoveTo(container, "c0", headerOf(container, "c2"));
  expect(onDragMove).toHaveBeenLastCalledWith(source, {
    hit: expect.objectContaining({ region: "header", headerId: "c2" }),
    placement: { targetId: "c2", position: "after" },
    point: expect.any(Object),
    across: false,
    acrossAllowed: false,
  });

  const header = headerOf(container, "c2").getBoundingClientRect();
  const cell = cellOf(container, 2, 2).getBoundingClientRect();
  await commands.moveBy(0, cell.top + cell.height / 2 - (header.top + header.height / 2));
  await nextFrame();
  expect(onDragMove).toHaveBeenLastCalledWith(source, {
    hit: expect.objectContaining({ region: "body", rowId: 2, columnId: "c2" }),
    placement: null,
    point: expect.any(Object),
    across: true,
    acrossAllowed: true,
  });

  await commands.release();
  expect(onDragMove).toHaveBeenLastCalledWith(source, null);
});

test("a column dropped across onto a row header calls onDropAcross with the row's hit, not onColumnsDrop", async () => {
  const onDropAcross = vi.fn();
  const { container, onColumnsDrop } = await renderColumnGrips({
    canDropAcross: () => true,
    onDropAcross,
  });

  await pressGripAndMoveTo(container, "c0", cellOf(container, 2, 2));
  await commands.release();

  expect(onColumnsDrop).not.toHaveBeenCalled();
  expect(onDropAcross).toHaveBeenCalledTimes(1);
  expect(onDropAcross.mock.calls[0]).toEqual([
    { kind: "columns", ids: ["c0"] },
    expect.objectContaining({ region: "body", rowId: 2, columnId: "c2" }),
    { x: expect.any(Number), y: expect.any(Number) },
  ]);
});

test("a column released across where canDropAcross refuses fires no drop", async () => {
  const onDropAcross = vi.fn();
  const { container, onColumnsDrop } = await renderColumnGrips({
    canDropAcross: () => false,
    onDropAcross,
  });

  await pressGripAndMoveTo(container, "c0", cellOf(container, 2, 2));
  await commands.release();

  expect(onDropAcross).not.toHaveBeenCalled();
  expect(onColumnsDrop).not.toHaveBeenCalled();
});

test("with canDropAcross, a column over a body cell that isn't a row header still reorders by its x", async () => {
  const onDropAcross = vi.fn();
  const { container, onColumnsDrop } = await renderColumnGrips({
    canDropAcross: () => true,
    onDropAcross,
  });

  await pressGripAndMoveTo(container, "c0", cellOf(container, 2, 3));
  await commands.release();

  expect(onDropAcross).not.toHaveBeenCalled();
  expect(onColumnsDrop).toHaveBeenCalledTimes(1);
  expect(onColumnsDrop.mock.calls[0][0]).toMatchObject({ ids: ["c0"], targetId: "c3" });
});

test("a column released where something drawn above the grid covers it fires no drop", async () => {
  const { container, onColumnsDrop } = await renderColumnGrips();
  const box = headerOf(container, "c2").getBoundingClientRect();
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    zIndex: "9999",
  });
  document.body.append(overlay);

  await pressGripAndMoveTo(container, "c0", headerOf(container, "c2"));
  await commands.release();
  overlay.remove();

  expect(onColumnsDrop).not.toHaveBeenCalled();
});

test("without canDropAcross, a column dragged over the body still reorders by its x", async () => {
  const { container, onColumnsDrop } = await renderColumnGrips();

  await pressGripAndMoveTo(container, "c0", cellOf(container, 2, 2));
  await commands.release();

  expect(onColumnsDrop).toHaveBeenCalledTimes(1);
  expect(onColumnsDrop.mock.calls[0][0]).toMatchObject({
    ids: ["c0"],
    targetId: "c2",
    position: "after",
  });
});

test("an external drag held at the bottom edge scrolls, and the target follows the scroll", async () => {
  const seen: (RowId | null)[] = [];
  const onExternalDragOver = ({ hit }: ExternalDragEvent) => {
    seen.push(hit?.rowId ?? null);
    return true;
  };
  const { container } = render(
    <DataGrid
      {...createFixture(500, 3)}
      onExternalDragOver={onExternalDragOver}
      aria-label="External"
      style={{ width: 800, height: 400 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);
  const box = scroller.getBoundingClientRect();
  const x = box.left + 100;
  const y = box.bottom - 10;

  document.elementFromPoint(x, y)?.dispatchEvent(
    new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      dataTransfer: new DataTransfer(),
    }),
  );
  await frames(20);

  expect(scroller.scrollTop).toBeGreaterThan(0);
  expect(seen.at(-1)).not.toBe(seen[0]);
});

test("an indicator after a column runs through header and body and follows a live resize", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(20, 4)}
      indicator={{ kind: "columns", id: "c1", position: "after" }}
      aria-label="Indicator"
      style={{ width: 900, height: 400 }}
    />,
  );
  await settle();
  const marker = () =>
    container.querySelector('[data-axis="columns"]')?.getBoundingClientRect() as DOMRect;
  const edge = () =>
    container.querySelector('[data-header-id="c1"]')?.getBoundingClientRect().right ?? 0;
  const firstRow = rowOf(container, 0)?.getBoundingClientRect();
  const header = container.querySelector('[data-header-id="c1"]')?.getBoundingClientRect();

  expect(marker().left + marker().width / 2).toBeCloseTo(edge(), 0);
  expect(marker().top).toBeLessThanOrEqual(header?.top ?? 0);
  expect(marker().bottom).toBeGreaterThan(firstRow?.bottom ?? Infinity);

  await commands.pressOn('[data-resize-handle="c0"]');
  await commands.moveBy(60, 0);
  await nextFrame();

  expect(marker().left + marker().width / 2).toBeCloseTo(edge(), 0);
  await commands.release();
});

test("outlines frame their rows across the grid, and their columns from header to the last row", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(3, 4)}
      outlines={[
        { kind: "rows", ids: [1, 2] },
        { kind: "columns", ids: ["c1", "c2"] },
      ]}
      aria-label="Outlines"
      style={{ width: 900, height: 400 }}
    />,
  );
  await settle();
  const box = (axis: string) =>
    container.querySelector(`[data-axis="${axis}"]`)?.getBoundingClientRect() as DOMRect;
  const header = (id: string) =>
    container.querySelector(`[data-header-id="${id}"]`)?.getBoundingClientRect() as DOMRect;
  const second = rowOf(container, 1)?.getBoundingClientRect() as DOMRect;
  const last = rowOf(container, 2)?.getBoundingClientRect() as DOMRect;

  expect(box("rows").top).toBeCloseTo(second.top, 0);
  expect(box("rows").bottom).toBeCloseTo(last.bottom, 0);
  expect(box("columns").left).toBeCloseTo(header("c1").left, 0);
  expect(box("columns").right).toBeCloseTo(header("c2").right, 0);
  expect(box("columns").top).toBeCloseTo(header("c1").top, 0);
  expect(box("columns").bottom).toBeCloseTo(last.bottom, 0);
});

test("typing keeps going after the editing row scrolls out of view, and Enter commits it", async () => {
  const apiRef = createRef<DataGridApi>();
  const onCellsChange = vi.fn();
  const { container } = render(
    <DataGrid
      {...createFixture(500, 3)}
      defaultCell={{ editable: true }}
      apiRef={apiRef}
      onCellsChange={onCellsChange}
      aria-label="Editing"
      style={{ width: 800, height: 400 }}
    />,
  );
  await settle();

  act(() => {
    apiRef.current?.editCell({ rowId: 0, columnId: "c0" });
  });
  await settle();
  await userEvent.keyboard("ab");
  scrollerOf(container).scrollTop = 10_000;
  await settle();
  await userEvent.keyboard("c{Enter}");

  expect(onCellsChange).toHaveBeenCalledTimes(1);
  expect(onCellsChange.mock.calls[0][0]).toMatchObject([
    { rowId: 0, columnId: "c0", value: "abc" },
  ]);
});
