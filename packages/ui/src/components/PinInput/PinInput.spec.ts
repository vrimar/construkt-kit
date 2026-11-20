import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-pininput--default"])) {
  test(
    `${id} typing fills the first empty slot and moves on, and Backspace clears back`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const slot = (n: number) => page.getByRole("textbox", { name: `pin code ${n} of 4` });

      await gallery.press(slot(3));
      await expect(slot(1)).toBeFocused();
      await page.keyboard.type("12");
      await expect(slot(2)).toHaveValue("2");
      await expect(slot(3)).toBeFocused();

      await page.keyboard.press("Backspace");
      await expect(slot(2)).toHaveValue("");
      await expect(slot(2)).toBeFocused();
      await expect(slot(1)).toHaveValue("1");
    },
  );

  test(
    `${id} a space typed into a filled numeric slot is refused`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const slot = (n: number) => page.getByRole("textbox", { name: `pin code ${n} of 4` });

      await gallery.press(slot(1));
      await page.keyboard.type("1");
      await page.keyboard.press("ArrowLeft");
      await expect(slot(1)).toBeFocused();
      await page.keyboard.press("Space");

      await expect(slot(1)).toHaveValue("1");
      await expect(slot(1)).toBeFocused();
    },
  );
}
