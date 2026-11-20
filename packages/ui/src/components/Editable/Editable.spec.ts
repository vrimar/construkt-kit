import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-editable--page-title"])) {
  test(
    `${id} Escape restores the value and leaves focus on the preview without reopening it`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
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
  );

  test(
    `${id} a press on the preview opens it with the text selected to type over`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("textbox", { name: "Document title" });

      await gallery.press(page.getByText("Quarterly review"));
      await expect(input).toBeFocused();
      await page.keyboard.type("Annual plan");

      await expect(input).toHaveValue("Annual plan");
    },
  );
}

for (const id of selectStories(["components-editable--double-click-rename"])) {
  test(
    `${id} F2 on a preview opens it and Enter keeps the new value with focus back on the preview`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByText("In store").focus();
      await page.keyboard.press("F2");

      const input = page.getByRole("textbox", { name: "Row label" });
      await expect(input).toBeFocused();
      await page.keyboard.type("Retail");
      await page.keyboard.press("Enter");

      await expect(input).toBeHidden();
      await expect(page.getByText("Retail")).toBeFocused();
    },
  );
}

for (const id of selectStories(["components-editable--multiline"])) {
  test(
    `${id} Enter starts a new line and Mod+Enter keeps the text with focus back on the preview`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
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
  );
}

for (const id of selectStories(["components-editable--default"])) {
  test(
    `${id} Cancel returns focus to the edit trigger`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "edit" }));
      await expect(page.getByRole("textbox", { name: "Name" })).toBeFocused();

      await gallery.press(page.getByRole("button", { name: "cancel" }));
      await expect(page.getByRole("button", { name: "edit" })).toBeFocused();
    },
  );
}
