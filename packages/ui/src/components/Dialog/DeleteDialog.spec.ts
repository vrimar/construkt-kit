import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-dialog-deletedialog--default"])) {
  test(
    `${id} opens on Cancel, so Enter cancels instead of deleting`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
      await page.keyboard.press("Enter");
      expect(await gallery.calls("onSubmit")).toEqual([]);
      expect(await gallery.calls("onClose")).toHaveLength(1);
    },
  );
}
