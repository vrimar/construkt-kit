import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";

import { rowHeight, rowOf, scrollerOf } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { frames, nextFrame, settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import type { DataGridApi, ExternalDragEvent, RowId } from "./types";

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
