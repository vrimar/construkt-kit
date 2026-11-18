import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { scrollerOf } from "../../test/dom";
import { type FixtureRow, createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import type { ColumnDef } from "./types";

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

test("scrolling sideways renders only the cells and headers that come into view", async () => {
  const fixture = createFixture(12, 444);
  const header = vi.fn((ctx: { columnId: string }) => ctx.columnId);
  const columnDefs: ColumnDef<FixtureRow>[] = fixture.columnDefs.map((def) => ({ ...def, header }));
  const getCell = vi.fn(() => undefined);
  const { container } = render(
    <DataGrid
      {...fixture}
      columnDefs={columnDefs}
      getCell={getCell}
      aria-label="Wide"
      style={{ width: 800, height: 600 }}
    />,
  );
  await settle();
  const cells = mountedCells(container);
  const headers = mountedHeaders(container);
  getCell.mockClear();
  header.mockClear();

  scrollerOf(container).scrollLeft = 600;
  await settle();

  const enteringCells = entering(cells, mountedCells(container));
  expect(enteringCells).toBeGreaterThan(0);
  expect(getCell).toHaveBeenCalledTimes(enteringCells);
  expect(header).toHaveBeenCalledTimes(entering(headers, mountedHeaders(container)));
});

test("scrolling down renders only the rows that come into view", async () => {
  const fixture = createFixture(300, 4);
  const renderFullWidthRow = vi.fn(({ rowId }: { rowId: unknown }) => String(rowId));
  const header = vi.fn(() => "Column");
  const { container } = render(
    <DataGrid
      {...fixture}
      columnDefs={fixture.columnDefs.map((def) => ({ ...def, header }))}
      isFullWidthRow={(row) => row.id % 2 === 0}
      renderFullWidthRow={renderFullWidthRow}
      aria-label="Tall"
      style={{ width: 800, height: 400 }}
    />,
  );
  await settle();
  const rows = () =>
    new Set(
      Array.from(container.querySelectorAll("[data-full-width]"), (cell) => cell.textContent),
    );
  const before = rows();
  renderFullWidthRow.mockClear();
  header.mockClear();

  scrollerOf(container).scrollTop = 300;
  await settle();

  const enteringRows = entering(before, rows());
  expect(enteringRows).toBeGreaterThan(0);
  expect(renderFullWidthRow).toHaveBeenCalledTimes(enteringRows);
  expect(header).not.toHaveBeenCalled();
});

test("hovering cells opens their tooltip without rendering the grid", async () => {
  const statusBar = vi.fn(() => "Status");
  render(
    <DataGrid
      {...createFixture(3, 2)}
      defaultCell={{ tooltip: ({ formattedValue }) => `About ${formattedValue}` }}
      statusBar={statusBar}
      aria-label="Tooltips"
      style={{ width: 800, height: 400 }}
    />,
  );
  await settle();
  statusBar.mockClear();

  await userEvent.hover(screen.getByRole("gridcell", { name: "R1C1" }));
  await screen.findByText("About R1C1", {}, { timeout: 2000 });
  await userEvent.hover(screen.getByRole("gridcell", { name: "R2C2" }));
  await screen.findByText("About R2C2", {}, { timeout: 2000 });

  expect(statusBar).not.toHaveBeenCalled();
});
