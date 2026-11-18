import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-dialog--no-backdrop"])) {
  test(
    `${id} opens with focus on its content, not the close trigger`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Open (no backdrop)" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog")).toBeFocused();
    },
  );
}
