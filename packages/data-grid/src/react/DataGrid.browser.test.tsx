import { render } from "@testing-library/react";
import { createPortal } from "react-dom";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { cellOf, rowHeight, rowOf, scrollerOf } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";

test("scrolling to row 50,000 mounts it at its offset and keeps the row count bounded", async () => {
  const fixture = createFixture(100_000, 200);
  const { container } = render(
    <DataGrid
      {...fixture}
      aria-label="Large"
      style={{ width: 800, height: 600 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);

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
  const { container } = render(
    <div data-density="compact">
      <DataGrid
        {...fixture}
        aria-label="Compact"
        style={{ width: 800, height: 600 }}
      />
    </div>,
  );
  await settle();

  const first = rowOf(container, 0)?.getBoundingClientRect();
  const tenth = rowOf(container, 10)?.getBoundingClientRect();
  expect(first?.height).toBe(28);
  expect((tenth?.top ?? 0) - (first?.top ?? 0)).toBe(280);
});

test("content taller than 15M px still reaches and positions the last row", async () => {
  const fixture = createFixture(100_000, 3);
  const { container } = render(
    <DataGrid
      {...fixture}
      getRowHeight={() => 200}
      aria-label="Tall"
      style={{ width: 800, height: 600 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);

  scroller.scrollTop = scroller.scrollHeight;
  await settle();

  const last = rowOf(container, 99_999)?.getBoundingClientRect();
  const viewport = scroller.getBoundingClientRect();
  expect(last).toBeDefined();
  expect(last?.height).toBe(200);
  expect(last?.bottom).toBeCloseTo(viewport.top + scroller.clientHeight, 0);
});

test("a clicked cell shows the active-cell ring, not only a keyboard-focused one", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(5, 3)}
      aria-label="Active cell"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const cell = cellOf(container, 1, 1);

  await userEvent.click(cell);

  expect(getComputedStyle(cell).outlineStyle).not.toBe("none");
});

test("a clicked cell isn't :focus-visible, and the cell an arrow key moves to is", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(5, 3)}
      aria-label="Focus visible"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const cell = cellOf(container, 1, 1);

  await userEvent.click(cell);
  expect(cell.matches(":focus-visible")).toBe(false);

  await userEvent.keyboard("{ArrowRight}");
  expect(cellOf(container, 1, 2).matches(":focus-visible")).toBe(true);
});

test("pressing a pinned row keeps keyboard focus on the active cell", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(20, 3)}
      pinnedBottomRows={[{ id: 99 }]}
      aria-label="Pinned"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const cell = cellOf(container, 1, 1);
  await userEvent.click(cell);

  await userEvent.click(
    container.querySelector("[data-pinned=bottom] [role=gridcell]") as HTMLElement,
  );

  expect(document.activeElement).toBe(cell);
});

test("an input portalled out of a header takes focus when clicked", async () => {
  const fixture = createFixture(5, 3);
  const { container } = render(
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
  await settle();
  await userEvent.click(cellOf(container, 1, 1));
  const input = document.querySelector<HTMLInputElement>(
    "input[aria-label=Find]",
  ) as HTMLInputElement;

  await userEvent.click(input);

  expect(document.activeElement).toBe(input);
});

test("the loading overlay leaves the toolbar uncovered", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(5, 3)}
      loading
      toolbar={<button>Cancel</button>}
      aria-label="Loading"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const toolbar = container.querySelector("button")?.getBoundingClientRect() as DOMRect;

  expect(document.elementFromPoint(toolbar.left + 4, toolbar.top + 4)?.textContent).toBe("Cancel");
});
