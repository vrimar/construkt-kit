import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-tabs--default"])) {
  test(
    `${id} arrow keys select the tab they move to and wrap past either end`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("tab", { name: "Overview" }).focus();

      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
      await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByRole("tabpanel", { name: "Settings" })).toBeVisible();

      await page.keyboard.press("End");
      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("tab", { name: "Overview" })).toBeFocused();
      await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
    },
  );
}

for (const id of selectStories(["components-tabs--manual-activation"])) {
  test(
    `${id} arrow keys only move focus, past the disabled tab, until Enter selects`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("tab", { name: "Overview" }).focus();

      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
      await expect(page.getByRole("tabpanel", { name: "Overview" })).toBeVisible();

      await page.keyboard.press("Enter");
      await expect(page.getByRole("tabpanel", { name: "Settings" })).toBeVisible();

      await page.keyboard.press("Home");
      await expect(page.getByRole("tab", { name: "Overview" })).toBeFocused();
      await expect(page.getByRole("tab", { name: "Settings" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    },
  );
}
