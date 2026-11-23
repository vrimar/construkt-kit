import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-combobox--default"],
  "Enter closes the list when the input already shows the selection",
  async ({ gallery, page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-combobox--default"],
  "leaving the closed list reverts typed text that matches no option",
  async ({ gallery, page }) => {
    const input = page.getByRole("combobox", { name: "Framework" });
    await gallery.press(input);
    await page.keyboard.type("Vue");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Vue");

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type("zz");
    await page.keyboard.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toHaveValue("zz");
    await page.keyboard.press("Tab");

    await expect(input).toHaveValue("Vue");
  },
  { only: "desktop" },
);

storyTest(
  ["components-combobox--default"],
  "typing mid-text opens the list without moving the caret",
  async ({ gallery, page }) => {
    const input = page.getByRole("combobox", { name: "Framework" });
    await gallery.press(input);
    await page.keyboard.type("Rt");
    await page.keyboard.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.type("e");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await gallery.settle();
    await page.keyboard.type("a");

    await expect(input).toHaveValue("Reat");
  },
  { only: "desktop" },
);

storyTest(
  ["components-combobox--in-dialog"],
  "Escape closes the list, then reverts unmatched text, then closes the dialog",
  async ({ gallery, page }) => {
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
  { only: "desktop" },
);
