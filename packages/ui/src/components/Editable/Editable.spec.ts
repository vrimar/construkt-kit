import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-editable--page-title"],
  "Escape restores the value and leaves focus on the preview without reopening it",
  async ({ page }) => {
    const preview = page.getByText("Quarterly review");
    const input = page.getByRole("textbox", { name: "Document title" });

    await preview.focus();
    await expect(input).toBeFocused();
    await page.keyboard.type("Annual plan");
    await page.keyboard.press("Escape");

    await expect(input).toBeHidden();
    await expect(preview).toBeFocused();
    await expect(preview).toHaveText("Quarterly review");
  },
  { only: "desktop" },
);

storyTest(
  ["components-editable--page-title"],
  "a press on the preview opens it with the text selected to type over",
  async ({ gallery, page }) => {
    const input = page.getByRole("textbox", { name: "Document title" });

    await gallery.press(page.getByText("Quarterly review"));
    await expect(input).toBeFocused();
    await page.keyboard.type("Annual plan");

    await expect(input).toHaveValue("Annual plan");
  },
);

storyTest(
  ["components-editable--double-click-rename"],
  "F2 on a preview opens it and Enter keeps the new value with focus back on the preview",
  async ({ page }) => {
    await page.getByText("In store").focus();
    await page.keyboard.press("F2");

    const input = page.getByRole("textbox", { name: "Row label" });
    await expect(input).toBeFocused();
    await page.keyboard.type("Retail");
    await page.keyboard.press("Enter");

    await expect(input).toBeHidden();
    await expect(page.getByText("Retail")).toBeFocused();
  },
  { only: "desktop" },
);

storyTest(
  ["components-editable--multiline"],
  "Enter starts a new line and Mod+Enter keeps the text with focus back on the preview",
  async ({ page }) => {
    const preview = page.getByLabel("edit", { exact: true });
    const notes = page.getByRole("textbox", { name: "Notes" });

    await preview.focus();
    await expect(notes).toBeFocused();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Book the van");
    await expect(notes).toBeVisible();
    await expect(notes).toHaveValue("Call the supplier\nConfirm the delivery date\nBook the van");

    await page.keyboard.press("ControlOrMeta+Enter");
    await expect(notes).toBeHidden();
    await expect(preview).toBeFocused();
    await expect(preview).toHaveText("Call the supplier Confirm the delivery date Book the van");
  },
  { only: "desktop" },
);

storyTest(
  ["components-editable--default"],
  "Cancel returns focus to the edit trigger",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "edit" }));
    await expect(page.getByRole("textbox", { name: "Name" })).toBeFocused();

    await gallery.press(page.getByRole("button", { name: "cancel" }));
    await expect(page.getByRole("button", { name: "edit" })).toBeFocused();
  },
  { only: "desktop" },
);
