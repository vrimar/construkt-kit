import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-popover-confirmpopover--destructive"])) {
  test(
    `${id} opens on Cancel, not the destructive action`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Delete project" }));
      await expect(
        page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }),
      ).toBeFocused();
    },
  );
}
