import { expect, storyTest } from "@construkt-kit/story-kit/test";
import { startDrag } from "@construkt-kit/testing";

import {
  dropIndicator,
  dropPlacement,
  gridByName,
  gridCell,
  gridGrip,
  gridHeader,
  gridRow,
  gridRowHeader,
  selectedCells,
  selectedHeaders,
  selectedRows,
} from "./index";

storyTest(
  ["data-datagrid--reorder"],
  "a row grip held over another row reads onto it, then after it from its lower third",
  async ({ page }) => {
    const grid = gridByName(page, "Reorder");
    const target = gridRowHeader(grid, 3);
    const drag = await startDrag(page, gridGrip(gridRow(grid, 0)), { kind: "pointer" });

    await drag.moveTo(target, { until: dropIndicator(grid, { axis: "rows", position: "onto" }) });
    await expect
      .poll(() => dropPlacement(grid))
      .toEqual({ axis: "rows", position: "onto", row: 3 });

    const height = (await target.boundingBox())?.height ?? 0;
    await drag.moveTo(target, { position: { x: 8, y: height - 3 } });
    await expect
      .poll(() => dropPlacement(grid))
      .toEqual({ axis: "rows", position: "after", row: 3 });
  },
  { only: "desktop" },
);

storyTest(
  ["data-datagrid--reorder-tree"],
  "a column grip held at the start of its group's first column reads before that column, not the group",
  async ({ page }) => {
    const grid = gridByName(page, "Survey");
    const drag = await startDrag(page, gridGrip(gridHeader(grid, "female")), { kind: "pointer" });

    await drag.moveTo(gridHeader(grid, "male"), {
      position: { x: 4, y: 4 },
      until: dropIndicator(grid, { axis: "columns" }),
    });

    await expect
      .poll(() => dropPlacement(grid))
      .toEqual({ axis: "columns", position: "before", columnId: "male" });
  },
  { only: "desktop" },
);

storyTest(
  ["data-datagrid--selection"],
  "a cell range, a header click and a row's checkbox cell each read back as selected",
  async ({ page }) => {
    const grid = gridByName(page, "Selection");

    await gridCell(grid, 1, 2).click();
    await gridCell(grid, 2, 3).click({ modifiers: ["Shift"] });
    await expect(selectedCells(grid)).toHaveText(["Globex", "West", "Initech", "East"]);

    await gridHeader(grid, "customer").click();
    await expect(selectedHeaders(grid)).toHaveText(["Customer"]);

    await gridCell(grid, 1, 0).click();
    await expect(selectedRows(grid)).toContainText(["Globex"]);
  },
  { only: "desktop" },
);
