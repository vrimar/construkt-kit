import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-toolbar--collapsing-labels"])) {
  test(
    `${id} Tab moves through the controls of a popover opened from it`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Notes" }));
      await expect(page.getByRole("textbox", { name: "Note" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Save note" })).toBeFocused();
    },
  );

  test(
    `${id} collapses below its threshold and expands again`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const toolbar = page.getByRole("toolbar", { name: "Table actions" });
      const frame = page.locator("#storybook-root > *").first();
      await gallery.resizeTo(frame, 360);
      await expect(toolbar).toHaveAttribute("data-collapsed");
      await gallery.resizeTo(frame, 900);
      await expect(toolbar).not.toHaveAttribute("data-collapsed");
    },
  );

  test(
    `${id} moves the collapsed labels' tooltip with the arrow keys`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const toolbar = page.getByRole("toolbar", { name: "Table actions" });
      await gallery.resizeTo(page.locator("#storybook-root > *").first(), 360);
      await expect(toolbar).toHaveAttribute("data-collapsed");
      await page.keyboard.press("Tab");
      await expect(toolbar.getByRole("button", { name: "Filter" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(toolbar.getByRole("button", { name: "Sort" })).toBeFocused();
      await expect(page.getByRole("tooltip")).toHaveCount(1);
      await expect(page.getByRole("tooltip")).toHaveText("Sort");
    },
  );
}
