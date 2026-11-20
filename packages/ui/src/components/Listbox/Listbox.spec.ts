import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-listbox--selections"])) {
  test(
    `${id} the arrow keys start from the selected option once the list takes focus`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const list = page.getByRole("listbox", { name: "check" });
      await list.focus();
      await page.keyboard.press("ArrowDown");

      await expect(list.getByRole("option", { name: "Cherry" })).toHaveAttribute(
        "data-highlighted",
        "",
      );
    },
  );
}
