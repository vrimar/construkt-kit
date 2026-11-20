import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-popover-promptpopover--default"])) {
  test(
    `${id} Enter in the field returns focus to the trigger with its focus ring`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page
        .getByRole("button", { name: "New folder" })
        .and(page.locator("[aria-expanded]"));
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("textbox", { name: "New folder" })).toBeFocused();

      await page.keyboard.press("Enter");

      await expect(trigger).toBeFocused();
      expect(await trigger.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    },
  );
}
