import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-togglegroup--default"],
  "Tab reaches the first item and arrow keys move focus between the items, wrapping",
  async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Bold" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Italic" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("button", { name: "Underline" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Bold" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Italic" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  },
  { only: "desktop" },
);

storyTest(
  ["components-togglegroup--single"],
  "Tab comes back to the checked item, not the first",
  async ({ page }) => {
    const radio = (name: string) => page.getByRole("radio", { name });
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(radio("Center")).toHaveAttribute("aria-checked", "true");

    await page.keyboard.press("Tab");
    await expect(radio("Center")).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");

    await expect(radio("Center")).toBeFocused();
  },
  { only: "desktop" },
);
