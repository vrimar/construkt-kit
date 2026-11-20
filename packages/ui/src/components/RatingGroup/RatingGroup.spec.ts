import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-ratinggroup--default"])) {
  test(
    `${id} arrows, Home and End move the rating and focus together`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const star = (count: number) => page.getByRole("radio", { name: `${count} stars` });

      await star(3).focus();
      await page.keyboard.press("ArrowRight");
      await expect(star(4)).toBeFocused();
      await expect(star(4)).toBeChecked();
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await expect(star(2)).toBeFocused();
      await expect(star(2)).toBeChecked();
      await page.keyboard.press("End");
      await expect(star(5)).toBeFocused();
      await page.keyboard.press("Home");
      await expect(star(1)).toBeFocused();
      await expect(star(1)).toBeChecked();
    },
  );
}
