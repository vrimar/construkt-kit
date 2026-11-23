import { expect, test, vi } from "vitest";
import { commands } from "vitest/browser";

import { mountGrid } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import { cellSelector } from "./dom";
import type { CellRange } from "./types";

test("a vertical swipe starting on a cell scrolls, and dragging the range handle extends the range", async () => {
  const onCellSelectionChange = vi.fn<(ranges: readonly CellRange[]) => void>();
  const { scroller } = await mountGrid(
    <DataGrid
      {...createFixture(200, 4, { width: 90 })}
      onCellSelectionChange={onCellSelectionChange}
      aria-label="Touch"
      style={{ width: 360, height: 500 }}
    />,
  );

  // Held before lifting, so no fling keeps scrolling the grid under the range handle's drag.
  await commands.touchDrag(cellSelector(6, 1), 0, -250, 150);
  await vi.waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(100));

  scroller.scrollTop = 0;
  await settle();
  await commands.touchDrag("[data-corner=end]", 100, 120);

  expect(onCellSelectionChange).toHaveBeenCalledTimes(1);
  const [[range]] = onCellSelectionChange.mock.calls[0];
  expect(range.start).toEqual({ rowId: 0, columnId: "c0" });
  expect(range.end.rowId).toBeGreaterThan(0);
  expect(range.end.columnId).not.toBe("c0");
});
