import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-togglegroup--default"])) {
  test(
    `${id} Tab reaches the first item and arrow keys move focus between the items, wrapping`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

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
  );
}
