import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-menu--context-menu"])) {
  test(
    `${id} closing returns focus to the context trigger`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const area = page.getByRole("button", { name: "Right-click here" });
      await area.click({ button: "right" });
      await expect(page.getByRole("menu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(area).toBeFocused();
    },
  );
}
