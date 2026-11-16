import { selectedStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const story of selectedStories()) {
  test(story.id, { tag: storyTags(story.id) }, async ({ gallery, storyTheme }) => {
    await gallery.open(story.id);
    await gallery.expectAccessible();
    if (storyTheme === "dark") return;
    await gallery.expectAriaTree(story.id);
    await gallery.expectScreenshot(story.id);
  });
}
