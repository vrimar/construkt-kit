import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-popover-promptpopover--default"],
  "Enter in the field returns focus to the trigger with its focus ring",
  async ({ page }) => {
    const trigger = page
      .getByRole("button", { name: "New folder" })
      .and(page.locator("[aria-expanded]"));
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("textbox", { name: "New folder" })).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(trigger).toBeFocusVisible();
  },
  { only: "desktop" },
);
