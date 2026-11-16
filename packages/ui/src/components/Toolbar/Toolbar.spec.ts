import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-toolbar--collapsing-labels"])) {
  test(
    `${id} collapses below its threshold and expands again`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const toolbar = page.getByRole("toolbar", { name: "Table actions" });
      const frame = page.locator("#storybook-root > *").first();
      await gallery.resizeTo(frame, 360);
      await expect(toolbar).toHaveAttribute("data-collapsed");
      await gallery.resizeTo(frame, 900);
      await expect(toolbar).not.toHaveAttribute("data-collapsed");
    },
  );
}
