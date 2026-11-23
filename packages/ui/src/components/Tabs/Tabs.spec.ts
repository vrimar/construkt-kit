import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-tabs--default"],
  "arrow keys select the tab they move to and wrap past either end",
  async ({ page }) => {
    await page.getByRole("tab", { name: "Overview" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel", { name: "Settings" })).toBeVisible();

    await page.keyboard.press("End");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Overview" })).toBeFocused();
    await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-tabs--manual-activation"],
  "arrow keys only move focus, past the disabled tab, until Enter selects",
  async ({ page }) => {
    await page.getByRole("tab", { name: "Overview" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
    await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.getByRole("tabpanel", { name: "Settings" })).toBeVisible();

    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "Overview" })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
  { only: "desktop" },
);
