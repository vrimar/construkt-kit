import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-combobox--default"])) {
  const tag = [...storyTags(id), "@desktop-only"];

  test(
    `${id} Enter closes the list when the input already shows the selection`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("combobox", { name: "Framework" });
      await gallery.press(input);
      await page.keyboard.type("Vue");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(input).toHaveAttribute("aria-expanded", "false");

      await page.keyboard.press("Backspace");
      await page.keyboard.type("e");
      await expect(input).toHaveAttribute("aria-expanded", "true");
      await expect(input).not.toHaveAttribute("aria-activedescendant");
      await page.keyboard.press("Enter");

      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(input).toHaveValue("Vue");
    },
  );

  test(
    `${id} typing mid-text opens the list without moving the caret`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("combobox", { name: "Framework" });
      await gallery.press(input);
      await page.keyboard.type("Rt");
      await page.keyboard.press("Escape");
      await expect(input).toHaveAttribute("aria-expanded", "false");

      await page.keyboard.press("ArrowLeft");
      await page.keyboard.type("e");
      await expect(input).toHaveAttribute("aria-expanded", "true");
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      await page.keyboard.type("a");

      await expect(input).toHaveValue("Reat");
    },
  );
}

for (const id of selectStories(["components-combobox--in-dialog"])) {
  test(
    `${id} Escape closes the list, then reverts unmatched text, then closes the dialog`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const dialog = page.getByRole("dialog", { name: "Edit project" });
      const input = dialog.getByRole("combobox", { name: "Framework" });
      await gallery.press(input);
      await page.keyboard.type("zz");
      await expect(input).toHaveAttribute("aria-expanded", "true");

      await page.keyboard.press("Escape");
      await expect(input).toHaveAttribute("aria-expanded", "false");
      await expect(input).toHaveValue("zz");

      await page.keyboard.press("Escape");
      await expect(input).toHaveValue("");
      await expect(dialog).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    },
  );
}
