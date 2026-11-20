import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-radiocard--default"])) {
  test(
    `${id} a press on the group's label focuses its checked radio`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByText("Select a plan"));
      await expect(page.getByRole("radio", { name: "Starter" })).toBeFocused();
    },
  );
}
