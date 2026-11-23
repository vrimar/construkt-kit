import { TIMER_SLACK_MS, expect, storyTest } from "@construkt-kit/story-kit/test";

import { DEFAULT_OPEN_DELAY } from "./tooltipStore";

storyTest(
  ["components-tooltip--default"],
  "stays closed after a press while the pointer stays on the trigger",
  async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Hover me" });
    await trigger.hover();
    await expect(page.getByRole("tooltip")).toBeVisible();

    await trigger.click();
    await expect(page.getByRole("tooltip")).toBeHidden();
    const box = await trigger.boundingBox();
    if (!box) throw new Error("The trigger has no box to move over.");
    await page.mouse.move(box.x + 6, box.y + box.height / 2, { steps: 4 });
    await page.waitForTimeout(DEFAULT_OPEN_DELAY + TIMER_SLACK_MS);

    await expect(page.getByRole("tooltip")).toBeHidden();
  },
  { only: "desktop" },
);

storyTest(
  ["components-tooltip--open"],
  "an open tooltip describes its trigger and a press asks once to close it",
  async ({ gallery, page }) => {
    const trigger = page.getByRole("button", { name: "Keyboard shortcuts" });
    await expect(trigger).toHaveAccessibleDescription(/Keyboard shortcuts/);

    await gallery.press(trigger);
    await page.waitForTimeout(DEFAULT_OPEN_DELAY + TIMER_SLACK_MS);

    await expect(page.getByRole("tooltip")).toBeVisible();
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "trigger-press" })],
    ]);
  },
);

storyTest(
  ["components-tooltip--group"],
  "moving to the next trigger switches the tooltip without the open delay",
  async ({ page }) => {
    const next = await page.getByText("Customer satisfaction score by store").boundingBox();
    if (!next) throw new Error("The next trigger has no box to move to.");
    await page.getByText("Quarterly revenue by region and product line").hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveText("Quarterly revenue by region and product line");

    await page.mouse.move(next.x + 8, next.y + next.height / 2);

    await expect(tooltip).toHaveText("Customer satisfaction score by store", {
      timeout: DEFAULT_OPEN_DELAY / 2,
    });
  },
  { only: "desktop" },
);

storyTest(
  ["components-tooltip--default-open"],
  "hovering another trigger closes the tooltip open since load",
  async ({ page }) => {
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveText(/Undo/);

    await page.getByRole("button", { name: "Redo" }).hover();

    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveText(/Redo/);
  },
  { only: "desktop" },
);
