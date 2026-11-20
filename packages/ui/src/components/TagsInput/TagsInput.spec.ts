import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-tagsinput--default"])) {
  test(
    `${id} Backspace highlights the last tag, then deletes it and highlights the one before`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const preview = (tag: string) =>
        page.locator(`[data-slot="itemPreview"][data-value="${tag}"]`);

      await gallery.press(page.getByRole("textbox", { name: "Tags" }));
      await page.keyboard.press("Backspace");
      await expect(preview("Vue")).toHaveAttribute("data-highlighted", "");
      await expect(page.getByRole("button", { name: "Delete tag Vue" })).toHaveCount(1);

      await page.keyboard.press("Backspace");
      await expect(page.getByRole("button", { name: "Delete tag Vue" })).toHaveCount(0);
      await expect(preview("React")).toHaveAttribute("data-highlighted", "");
    },
  );

  test(
    `${id} a comma ends the typed tag and empties the input`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("textbox", { name: "Tags" });

      await gallery.press(input);
      await page.keyboard.type("Svelte,");
      await expect(page.getByRole("button", { name: "Delete tag Svelte" })).toHaveCount(1);
      await expect(input).toHaveValue("");
      await expect(input).toBeFocused();
    },
  );

  test(
    `${id} Delete removes the highlighted tag and keeps navigating from the next one`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("textbox", { name: "Tags" });
      const preview = (tag: string) =>
        page.locator(`[data-slot="itemPreview"][data-value="${tag}"]`);

      await gallery.press(input);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Delete");
      await expect(page.getByRole("button", { name: "Delete tag React" })).toHaveCount(0);
      await expect(preview("Vue")).toHaveAttribute("data-highlighted", "");

      await page.keyboard.press("Escape");
      await expect(preview("Vue")).not.toHaveAttribute("data-highlighted");
      await expect(input).toBeFocused();
    },
  );
}

for (const id of selectStories(["components-tagsinput--in-dialog"])) {
  test(
    `${id} Escape leaves tag navigation, then closes the dialog`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const dialog = page.getByRole("dialog", { name: "Edit post" });
      const vue = dialog.locator(`[data-slot="itemPreview"][data-value="Vue"]`);
      await gallery.press(dialog.getByRole("textbox", { name: "Tags" }));
      await page.keyboard.press("Backspace");
      await expect(vue).toHaveAttribute("data-highlighted", "");

      await page.keyboard.press("Escape");
      await expect(vue).not.toHaveAttribute("data-highlighted");
      await expect(dialog).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    },
  );
}
