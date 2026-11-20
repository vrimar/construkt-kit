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

  test(
    `${id} Cancel from the keyboard returns focus to the trigger with its focus ring`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page
        .getByRole("button", { name: "Delete project" })
        .and(page.locator("[aria-expanded]"));
      await trigger.focus();
      await page.keyboard.press("Enter");
      const cancel = page.getByRole("alertdialog").getByRole("button", { name: "Cancel" });
      await expect(cancel).toBeFocused();

      await page.keyboard.press("Enter");

      await expect(trigger).toBeFocused();
      expect(await trigger.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    },
  );
}
