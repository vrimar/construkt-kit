import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";

import { cellOf, rowHeight, scrollerOf } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { frames, settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import { cellSelector } from "./dom";
import type { CellRange } from "./types";

test("Mod+C on a focused cell writes its text to the clipboard as TSV", async () => {
  render(
    <>
      <button>before</button>
      <DataGrid
        {...createFixture(50, 2)}
        aria-label="Copy"
        style={{ width: 600, height: 300 }}
      />
    </>,
  );
  await settle();
  screen.getByRole("button", { name: "before" }).focus();
  await userEvent.tab();
  let copied: string | undefined;
  window.addEventListener("copy", (event) => {
    copied = event.clipboardData?.getData("text/plain");
  });

  await userEvent.keyboard("{Control>}c{/Control}");

  expect(copied).toBe("R1C1");
});

test("a range across pinned and centre columns keeps each overlay part on its cells after scrolling sideways", async () => {
  const fixture = createFixture(50, 10);
  const { container } = render(
    <DataGrid
      {...fixture}
      columnDefs={[{ id: "pinned", pinned: "left", width: 120 }, ...fixture.columnDefs]}
      aria-label="Ranges"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const rect = (selector: string) =>
    (container.querySelector(selector) as HTMLElement).getBoundingClientRect();
  const from = rect(cellSelector(1, 0));
  const to = rect(cellSelector(3, 2));
  await commands.pressOn(cellSelector(1, 0));
  await commands.moveBy(to.left + to.width / 2 - (from.left + from.width / 2), to.top - from.top);
  await commands.release();
  const scroller = scrollerOf(container);

  scroller.scrollLeft = 60;
  await settle();

  const union = (selectors: string[]) => {
    const rects = selectors.map(rect);
    return {
      left: Math.min(...rects.map((r) => r.left)),
      top: Math.min(...rects.map((r) => r.top)),
      right: Math.max(...rects.map((r) => r.right)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
    };
  };
  const parts = [...container.querySelectorAll<HTMLElement>("[data-kind=range]")].map((part) => {
    const { left, top, right, bottom } = part.getBoundingClientRect();
    return { left, top, right, bottom };
  });
  expect(parts).toEqual([
    union([cellSelector(1, 0), cellSelector(3, 0)]),
    union([cellSelector(1, 1), cellSelector(3, 2)]),
  ]);
});

test("Shift-clicks extend the range from the active cell, which keeps focus", async () => {
  const onCellSelectionChange = vi.fn<(ranges: readonly CellRange[]) => void>();
  const { container } = render(
    <DataGrid
      {...createFixture(20, 4)}
      onCellSelectionChange={onCellSelectionChange}
      aria-label="Shift"
      style={{ width: 600, height: 400 }}
    />,
  );
  await settle();
  await userEvent.click(cellOf(container, 1, 0));

  await userEvent.click(cellOf(container, 5, 2), { modifiers: ["Shift"] });
  await userEvent.click(cellOf(container, 3, 3), { modifiers: ["Shift"] });

  expect(onCellSelectionChange).toHaveBeenLastCalledWith([
    { start: { rowId: 1, columnId: "c0" }, end: { rowId: 3, columnId: "c3" } },
  ]);
  expect(document.activeElement).toBe(cellOf(container, 1, 0));
});

test("a drag-select held below the grid keeps extending the range as the grid scrolls", async () => {
  const onCellSelectionChange = vi.fn<(ranges: readonly CellRange[]) => void>();
  const { container } = render(
    <DataGrid
      {...createFixture(500, 3)}
      onCellSelectionChange={onCellSelectionChange}
      aria-label="Drag"
      style={{ width: 600, height: 300 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);
  const lastShown = Math.ceil(scroller.clientHeight / rowHeight(container));
  const start = cellOf(container, 1, 1).getBoundingClientRect();

  await commands.pressOn(cellSelector(1, 1));
  await commands.moveBy(
    0,
    scroller.getBoundingClientRect().bottom + 40 - (start.top + start.height / 2),
  );
  await frames(30);
  await commands.release();

  expect(onCellSelectionChange).toHaveBeenCalledTimes(1);
  const [[range]] = onCellSelectionChange.mock.calls[0];
  expect(range.end.rowId).toBeGreaterThan(lastShown);
});
