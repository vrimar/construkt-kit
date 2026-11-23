import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-tagsinput--default"],
  "Backspace highlights the last tag, then deletes it and highlights the one before",
  async ({ gallery, page }) => {
    const preview = (tag: string) => page.locator(`[data-slot="itemPreview"][data-value="${tag}"]`);

    await gallery.press(page.getByRole("textbox", { name: "Tags" }));
    await page.keyboard.press("Backspace");
    await expect(preview("Vue")).toHaveAttribute("data-highlighted", "");
    await expect(page.getByRole("button", { name: "Delete tag Vue" })).toHaveCount(1);

    await page.keyboard.press("Backspace");
    await expect(page.getByRole("button", { name: "Delete tag Vue" })).toHaveCount(0);
    await expect(preview("React")).toHaveAttribute("data-highlighted", "");
  },
);

storyTest(
  ["components-tagsinput--default"],
  "a comma ends the typed tag and empties the input",
  async ({ gallery, page }) => {
    const input = page.getByRole("textbox", { name: "Tags" });

    await gallery.press(input);
    await page.keyboard.type("Svelte,");
    await expect(page.getByRole("button", { name: "Delete tag Svelte" })).toHaveCount(1);
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
  },
);

storyTest(
  ["components-tagsinput--default"],
  "Delete removes the highlighted tag and keeps navigating from the next one",
  async ({ gallery, page }) => {
    const input = page.getByRole("textbox", { name: "Tags" });
    const preview = (tag: string) => page.locator(`[data-slot="itemPreview"][data-value="${tag}"]`);

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
  { only: "desktop" },
);

storyTest(
  ["components-tagsinput--in-dialog"],
  "Escape leaves tag navigation, then closes the dialog",
  async ({ gallery, page }) => {
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
  { only: "desktop" },
);
