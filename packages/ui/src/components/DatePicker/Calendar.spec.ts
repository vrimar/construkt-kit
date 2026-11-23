import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";

const focusedCell = (page: Page) => page.locator("[role=grid] [data-slot=tableCellTrigger]:focus");

storyTest(
  ["components-calendar--single"],
  "arrows move the focused day and Page Down pages the grid with it",
  async ({ page }) => {
    await page.locator('[role=grid] [tabindex="0"]').focus();
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Wednesday, March 11, 2026");

    await page.keyboard.press("ArrowDown");
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Wednesday, March 18, 2026");
    await page.keyboard.press("ArrowRight");
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Thursday, March 19, 2026");
    await page.keyboard.press("PageDown");
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Sunday, April 19, 2026");
    await expect(page.getByRole("grid")).toHaveAccessibleName("April 2026");
    await page.keyboard.press("Home");
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Monday, April 13, 2026");
    await page.keyboard.press("End");
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Sunday, April 19, 2026");
  },
  { only: "desktop" },
);

storyTest(
  ["components-calendar--range-across-new-year"],
  "the month and year views follow the focused day into the new year",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Choose Tuesday, January 8, 2030" }));

    await gallery.press(page.getByRole("button", { name: "December 2029" }));
    await expect(page.getByRole("grid")).toHaveAccessibleName("2030");
    await expect(focusedCell(page)).toHaveAccessibleName("Jan 2030");

    await gallery.press(page.getByRole("button", { name: "2030", exact: true }));
    await expect(page.getByRole("grid")).toHaveAccessibleName("2030 – 2039");
    await expect(focusedCell(page)).toHaveText("2030");
  },
  { only: "desktop" },
);

storyTest(
  ["components-datepicker--range"],
  "Enter picks a range's start and end, then focus returns to the trigger",
  async ({ gallery, page }) => {
    const triggerId = await page.getByRole("button", { name: "Select date" }).getAttribute("id");
    const trigger = page.locator(`[id="${triggerId}"]`);
    await gallery.press(trigger);
    await expect(focusedCell(page)).toHaveAccessibleName("Choose Wednesday, March 11, 2026");

    await page.keyboard.press("Enter");
    await expect(focusedCell(page)).toHaveAccessibleName(/Thursday, March 12, 2026$/);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveText("2026-03-11 – 2026-03-13");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocusVisible();
  },
  { only: "desktop" },
);
