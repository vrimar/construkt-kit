import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mountGrid } from "../../test/dom";
import { type FixtureRow, createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import type { CellRenderContext, ColumnDef } from "./types";

const mountedCells = (container: HTMLElement) =>
  new Set(
    Array.from(
      container.querySelectorAll<HTMLElement>("[data-row-index] [data-col-index]"),
      (cell) =>
        `${cell.closest<HTMLElement>("[data-row-index]")?.dataset.rowIndex}:${cell.dataset.colIndex}`,
    ),
  );

const mountedHeaders = (container: HTMLElement) =>
  new Set(
    Array.from(
      container.querySelectorAll<HTMLElement>("[data-header-id]"),
      (header) => header.dataset.headerId,
    ),
  );

const entering = <T,>(before: ReadonlySet<T>, after: ReadonlySet<T>) =>
  [...after].filter((key) => !before.has(key)).length;

const expectRenderedOnce = <T,>(
  rendered: readonly T[],
  before: ReadonlySet<T>,
  after: ReadonlySet<T>,
) => {
  const entered = [...after].filter((key) => !before.has(key));
  expect(entered.length).toBeGreaterThan(0);
  expect(rendered.filter((key) => before.has(key))).toEqual([]);
  expect(new Set(rendered).size).toBe(rendered.length);
};

test("scrolling sideways renders only the cells and headers that come into view", async () => {
  const fixture = createFixture(12, 444);
  const header = vi.fn((ctx: { columnId: string }) => ctx.columnId);
  const render = vi.fn((ctx: CellRenderContext<FixtureRow>) => ctx.formattedValue);
  const columnDefs: ColumnDef<FixtureRow>[] = fixture.columnDefs.map((def) => ({
    ...def,
    header,
    cell: { ...def.cell, render },
  }));
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      columnDefs={columnDefs}
      aria-label="Wide"
      style={{ width: 800, height: 600 }}
    />,
  );
  const cells = mountedCells(container);
  const headers = mountedHeaders(container);
  render.mockClear();
  header.mockClear();

  scroller.scrollLeft = 600;
  await settle();

  expectRenderedOnce(
    render.mock.calls.map(([ctx]) => `${ctx.rowIndex}:${ctx.columnIndex}`),
    cells,
    mountedCells(container),
  );
  expectRenderedOnce(
    header.mock.calls.map(([ctx]) => ctx.columnId),
    headers,
    mountedHeaders(container),
  );
});

test("scrolling down renders only the rows that come into view", async () => {
  const fixture = createFixture(300, 4);
  const renderFullWidthRow = vi.fn(({ rowId }: { rowId: unknown }) => String(rowId));
  const header = vi.fn(() => "Column");
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      columnDefs={fixture.columnDefs.map((def) => ({ ...def, header }))}
      isFullWidthRow={(row) => row.id % 2 === 0}
      renderFullWidthRow={renderFullWidthRow}
      aria-label="Tall"
      style={{ width: 800, height: 400 }}
    />,
  );
  const rows = () =>
    new Set(
      Array.from(container.querySelectorAll("[data-full-width]"), (cell) => cell.textContent),
    );
  const before = rows();
  renderFullWidthRow.mockClear();
  header.mockClear();

  scroller.scrollTop = 300;
  await settle();

  const enteringRows = entering(before, rows());
  expect(enteringRows).toBeGreaterThan(0);
  expect(renderFullWidthRow).toHaveBeenCalledTimes(enteringRows);
  expect(header).not.toHaveBeenCalled();
});

test("hovering cells opens their tooltip without rendering the grid", async () => {
  const statusBar = vi.fn(() => "Status");
  await mountGrid(
    <DataGrid
      {...createFixture(3, 2)}
      defaultCell={{ tooltip: ({ formattedValue }) => `About ${formattedValue}` }}
      statusBar={statusBar}
      aria-label="Tooltips"
      style={{ width: 800, height: 400 }}
    />,
  );
  statusBar.mockClear();

  await userEvent.hover(screen.getByRole("gridcell", { name: "R1C1" }));
  await screen.findByText("About R1C1", {}, { timeout: 2000 });
  await userEvent.hover(screen.getByRole("gridcell", { name: "R2C2" }));
  await screen.findByText("About R2C2", {}, { timeout: 2000 });

  expect(statusBar).not.toHaveBeenCalled();
});
