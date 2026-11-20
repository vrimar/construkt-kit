import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-avatar--lazy-image-in-closed-section"])) {
  test(
    `${id} a lazy image waiting behind its fallback loads once its section opens`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Reviewers" }));

      await expect(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
      await expect(page.getByText("AL", { exact: true })).toBeHidden();
    },
  );
}
