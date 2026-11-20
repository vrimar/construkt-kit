import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-dialog--with-pickers"])) {
  const tag = [...storyTags(id), "@desktop-only"];

  test(
    `${id} a press on the backdrop closes the menu open in the dialog, then the dialog`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Schedule delivery" }).click();
      const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
      const repeat = page.getByRole("button", { name: "Repeat: Never" });
      await repeat.click();
      await expect(page.getByRole("menuitem", { name: "Weekly" })).toBeVisible();

      await page.mouse.click(4, 4);

      await expect(repeat).toHaveAttribute("aria-expanded", "false");
      await expect(dialog).toBeVisible();
      await page.mouse.click(4, 4);
      await expect(dialog).toBeHidden();
    },
  );

  test(
    `${id} a press inside a shadow root in the dialog keeps it open`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Schedule delivery" }).click();
      const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
      await expect(dialog).toBeVisible();
      await dialog.evaluate((element) => {
        const text = document.createElement("span");
        text.textContent = "Text in a shadow root";
        const host = document.createElement("span");
        host.attachShadow({ mode: "open" }).append(text);
        element.querySelector("[data-slot=content]")?.append(host);
      });

      await page.getByText("Text in a shadow root").click();

      await expect(dialog).toBeVisible();
    },
  );

  test(
    `${id} Escape in a page's own dialog inside it closes that dialog first`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Schedule delivery" }).click();
      const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
      await expect(dialog).toBeVisible();
      await dialog.evaluate((element) => {
        const pageDialog = document.createElement("dialog");
        pageDialog.setAttribute("aria-label", "Page dialog");
        const note = document.createElement("input");
        note.setAttribute("aria-label", "Note");
        pageDialog.append(note);
        element.querySelector("[data-slot=content]")?.append(pageDialog);
        pageDialog.showModal();
      });
      const pageDialog = page.getByRole("dialog", { name: "Page dialog" });
      await expect(page.getByRole("textbox", { name: "Note" })).toBeFocused();

      await page.keyboard.press("Escape");

      await expect(pageDialog).toBeHidden();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    },
  );
}
