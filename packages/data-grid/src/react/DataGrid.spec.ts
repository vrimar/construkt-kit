import { TIMER_SLACK_MS, expect, storyTest } from "@construkt-kit/story-kit/test";

import { CELL_TOOLTIP_OPEN_DELAY } from "./cellTooltipDelay";

storyTest(
  ["data-datagrid--cell-tooltips"],
  "editing a cell opens no tooltip, from the double click or from hovering the editor",
  async ({ page }) => {
    await page.getByRole("gridcell", { name: "R2C2" }).dblclick();
    const editor = page.getByRole("textbox");
    await expect(editor).toBeFocused();
    await editor.hover({ position: { x: 8, y: 8 } });
    await page.waitForTimeout(CELL_TOOLTIP_OPEN_DELAY + TIMER_SLACK_MS);

    await expect(page.getByRole("tooltip")).toHaveCount(0);
  },
  { only: "desktop" },
);

storyTest(
  ["data-datagrid--cell-tooltips"],
  "a header click opens no tooltip, an arrow key opens the focused cell's, and a page scroll closes it",
  async ({ gallery, page }) => {
    await page.getByRole("columnheader", { name: "Column 2" }).click();
    await page.mouse.move(8, 600);
    await gallery.settle();
    await expect(page.getByRole("tooltip")).toHaveCount(0);

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tooltip")).toHaveText("About R2C2");

    await page.mouse.wheel(0, 120);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  },
  { only: "desktop" },
);
