import {
  type Locator,
  expect,
  selectStories,
  storyTags,
  test,
} from "@construkt-kit/story-kit/test";

const focusVisible = (locator: Locator) =>
  locator.evaluate((node) => node.matches(":focus-visible"));

for (const id of selectStories(["components-select--default"])) {
  const tag = [...storyTags(id), "@desktop-only"];

  test(
    `${id} a keyboard pick returns focus to the trigger with its ring`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const triggerId = await page.getByRole("button", { name: "Select fruit" }).getAttribute("id");
      const trigger = page.locator(`[id="${triggerId}"]`);
      await trigger.click();
      await expect(page.getByRole("option").first()).toBeVisible();

      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
      expect(await focusVisible(trigger)).toBe(true);
    },
  );

  test(
    `${id} a pointer pick returns focus to the trigger without its ring`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const triggerId = await page.getByRole("button", { name: "Select fruit" }).getAttribute("id");
      const trigger = page.locator(`[id="${triggerId}"]`);
      await trigger.click();

      await page.getByRole("option").first().click();

      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
      expect(await focusVisible(trigger)).toBe(false);
    },
  );
}

const searchableTriggers = {
  "components-applyselect--default": "Select frameworks",
  "components-tagselect--default": "Red",
} as const;

for (const id of selectStories(
  Object.keys(searchableTriggers) as (keyof typeof searchableTriggers)[],
)) {
  test(
    `${id} opening the list focuses its search`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: searchableTriggers[id] }));

      await expect(page.getByRole("textbox", { name: "Search..." })).toBeFocused();
    },
  );
}
