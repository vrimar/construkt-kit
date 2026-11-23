import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-popover-confirmpopover--destructive"],
  "opens on Cancel, not the destructive action",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Delete project" }));
    await expect(
      page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }),
    ).toBeFocused();
  },
);

storyTest(
  ["components-popover-confirmpopover--destructive"],
  "Cancel from the keyboard returns focus to the trigger with its focus ring",
  async ({ page }) => {
    const trigger = page
      .getByRole("button", { name: "Delete project" })
      .and(page.locator("[aria-expanded]"));
    await trigger.focus();
    await page.keyboard.press("Enter");
    const cancel = page.getByRole("alertdialog").getByRole("button", { name: "Cancel" });
    await expect(cancel).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(trigger).toBeFocusVisible();
  },
  { only: "desktop" },
);
