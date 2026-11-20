import { type Page, expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const focusedDay = (page: Page) =>
  page.locator("[role=grid][data-view=day] [data-slot=tableCellTrigger]:focus");

for (const id of selectStories(["components-calendar--range-with-presets"])) {
  test(
    `${id} Clear moves focus to the focused day`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Last 7 days" }));
      await gallery.press(page.getByRole("button", { name: "Clear" }));
      await expect(focusedDay(page)).toHaveCount(1);
    },
  );
}

for (const id of selectStories(["components-calendar--controlled"])) {
  test(
    `${id} a Clear its owner turns down leaves focus with the next field`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Clear" }));

      const notes = page.getByRole("textbox", { name: "Notes" });
      await gallery.press(notes);
      await page.keyboard.type("ok");

      await expect(notes).toBeFocused();
      await expect(notes).toHaveValue("ok");
    },
  );
}

for (const id of selectStories(["components-datepicker--range"])) {
  test(
    `${id} Clear keeps focus inside the open calendar`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Select date" }));
      await gallery.press(page.getByRole("button", { name: "Choose Thursday, March 12, 2026" }));
      await gallery.press(page.getByRole("button", { name: "Clear" }));
      await expect(focusedDay(page)).toHaveCount(1);
    },
  );
}
