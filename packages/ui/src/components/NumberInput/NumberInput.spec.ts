import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-numberinput--with-min-max"])) {
  test(
    `${id} arrows step by step, Shift by the large step, Home and End jump, all within the range`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("spinbutton");
      await input.focus();

      await page.keyboard.press("ArrowUp");
      await expect(input).toHaveValue("6");
      await page.keyboard.press("Shift+ArrowUp");
      await expect(input).toHaveValue("10");
      await page.keyboard.press("Shift+ArrowDown");
      await expect(input).toHaveValue("0");
      await page.keyboard.press("End");
      await expect(input).toHaveValue("10");
      await page.keyboard.press("Home");
      await expect(input).toHaveValue("0");
    },
  );

  test(
    `${id} a typed value outside the range is clamped on blur`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("spinbutton");
      await input.fill("50");
      await page.keyboard.press("Tab");
      await expect(input).toHaveValue("10");
    },
  );

  test(
    `${id} a press that reaches the max lets go at once, so the arrows work while it is still held`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const input = page.getByRole("spinbutton");
      const increment = page.getByRole("button", { name: "increment value" });
      await input.focus();
      await page.keyboard.press("End");
      await page.keyboard.press("ArrowDown");
      await expect(input).toHaveValue("9");

      await increment.hover();
      await page.mouse.down();
      await expect(input).toHaveValue("10");
      await expect(increment).toBeDisabled();
      await page.keyboard.press("ArrowDown");
      await expect(input).toHaveValue("9");
      await page.mouse.up();
    },
  );
}
