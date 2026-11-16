import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-numberfilter--default"])) {
  test(
    `${id} switching to and from between keeps focus on the operator`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Equals" }));
      await gallery.press(page.getByRole("menuitemradio", { name: /Between/ }));
      await expect(page.getByRole("button", { name: "Between" })).toBeFocused();
      await gallery.press(page.getByRole("button", { name: "Between" }));
      await gallery.press(page.getByRole("menuitemradio", { name: /Equals/ }));
      await expect(page.getByRole("button", { name: "Equals" })).toBeFocused();
    },
  );
}
