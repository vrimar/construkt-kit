import { createPortal } from "react-dom";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { cellOf, mountGrid, rowHeight, rowOf } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";

test("scrolling to row 50,000 mounts it at its offset and keeps the row count bounded", async () => {
  const fixture = createFixture(100_000, 200);
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      aria-label="Large"
      style={{ width: 800, height: 600 }}
    />,
  );

  scroller.scrollTop = 50_000 * rowHeight(container);
  await settle();

  const row = rowOf(container, 50_000);
  const header = container.querySelector("[role=columnheader]")?.getBoundingClientRect();
  expect(row).not.toBeNull();
  expect(row?.getBoundingClientRect().top).toBeCloseTo(header?.bottom ?? Number.NaN, 0);
  expect(
    container.querySelectorAll("[role=rowgroup] [role=row][data-row-index]").length,
  ).toBeLessThan(80);
});

test("under compact density rows measure 28px and row N sits at 28N", async () => {
  const fixture = createFixture(200, 5);
  const { container } = await mountGrid(
    <div data-density="compact">
      <DataGrid
        {...fixture}
        aria-label="Compact"
        style={{ width: 800, height: 600 }}
      />
    </div>,
  );

  const first = rowOf(container, 0)?.getBoundingClientRect();
  const tenth = rowOf(container, 10)?.getBoundingClientRect();
  expect(first?.height).toBe(28);
  expect((tenth?.top ?? 0) - (first?.top ?? 0)).toBe(280);
});

test("content taller than 15M px still reaches and positions the last row", async () => {
  const fixture = createFixture(100_000, 3);
  const { container, scroller } = await mountGrid(
    <DataGrid
      {...fixture}
      getRowHeight={() => 200}
      aria-label="Tall"
      style={{ width: 800, height: 600 }}
    />,
  );

  scroller.scrollTop = scroller.scrollHeight;
  await settle();

  const last = rowOf(container, 99_999)?.getBoundingClientRect();
  const viewport = scroller.getBoundingClientRect();
  expect(last).toBeDefined();
  expect(last?.height).toBe(200);
  expect(last?.bottom).toBeCloseTo(viewport.top + scroller.clientHeight, 0);
});

test("a clicked cell shows the active-cell ring, not only a keyboard-focused one", async () => {
  const { container } = await mountGrid(
    <DataGrid
      {...createFixture(5, 3)}
      aria-label="Active cell"
      style={{ width: 600, height: 300 }}
    />,
  );
  const cell = cellOf(container, 1, 1);

  await userEvent.click(cell);

  expect(getComputedStyle(cell).outlineStyle).not.toBe("none");
});

test("a clicked cell isn't :focus-visible, and the cell an arrow key moves to is", async () => {
  const { container } = await mountGrid(
    <DataGrid
      {...createFixture(5, 3)}
      aria-label="Focus visible"
      style={{ width: 600, height: 300 }}
    />,
  );
  const cell = cellOf(container, 1, 1);

  await userEvent.click(cell);
  expect(cell.matches(":focus-visible")).toBe(false);

  await userEvent.keyboard("{ArrowRight}");
  expect(cellOf(container, 1, 2).matches(":focus-visible")).toBe(true);
});

test("Tab in the editor of the last cell commits and leaves the grid", async () => {
  const onCellsChange = vi.fn();
  const { container } = await mountGrid(
    <>
      <DataGrid
        {...createFixture(2, 2)}
        defaultCell={{ editable: true }}
        onCellsChange={onCellsChange}
        aria-label="Editing"
        style={{ width: 600, height: 300 }}
      />
      <button>after</button>
    </>,
  );
  await userEvent.click(cellOf(container, 1, 1));

  await userEvent.keyboard("{F2}B{Tab}");

  expect(document.activeElement).toHaveProperty("textContent", "after");
  expect(onCellsChange.mock.calls.map(([[change]]) => change.value)).toEqual(["B"]);
});

test("pressing a pinned row keeps keyboard focus on the active cell", async () => {
  const { container } = await mountGrid(
    <DataGrid
      {...createFixture(20, 3)}
      pinnedBottomRows={[{ id: 99 }]}
      aria-label="Pinned"
      style={{ width: 600, height: 300 }}
    />,
  );
  const cell = cellOf(container, 1, 1);
  await userEvent.click(cell);

  await userEvent.click(
    container.querySelector("[data-pinned=bottom] [role=gridcell]") as HTMLElement,
  );

  expect(document.activeElement).toBe(cell);
});

test("an input portalled out of a header takes focus when clicked", async () => {
  const fixture = createFixture(5, 3);
  const { container } = await mountGrid(
    <DataGrid
      {...fixture}
      columnDefs={[
        {
          ...fixture.columnDefs[0],
          header: () => createPortal(<input aria-label="Find" />, document.body),
        },
        ...fixture.columnDefs.slice(1),
      ]}
      aria-label="Portal"
      style={{ width: 600, height: 300 }}
    />,
  );
  await userEvent.click(cellOf(container, 1, 1));
  const input = document.querySelector<HTMLInputElement>(
    "input[aria-label=Find]",
  ) as HTMLInputElement;

  await userEvent.click(input);

  expect(document.activeElement).toBe(input);
});

test("the loading overlay leaves the toolbar uncovered", async () => {
  const { container } = await mountGrid(
    <DataGrid
      {...createFixture(5, 3)}
      loading
      toolbar={<button>Cancel</button>}
      aria-label="Loading"
      style={{ width: 600, height: 300 }}
    />,
  );
  const toolbar = container.querySelector("button")?.getBoundingClientRect() as DOMRect;

  expect(document.elementFromPoint(toolbar.left + 4, toolbar.top + 4)?.textContent).toBe("Cancel");
});
