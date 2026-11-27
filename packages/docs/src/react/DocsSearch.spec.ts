import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["docs-docsshell--page"],
  "the shortcut opens search, and following a result moves focus to the new page",
  async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+K");
    const dialog = page.getByRole("dialog", { name: "Search the docs" });
    await expect(dialog.getByRole("combobox", { name: "Search the docs" })).toBeFocused();

    await page.keyboard.type("choose");
    await expect(dialog.getByRole("option", { name: "Choose a role" })).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(dialog).toBeHidden();
    await expect(page.getByRole("link", { name: "Invite people" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator("#docs-content")).toBeFocused();
  },
  { only: "desktop" },
);
