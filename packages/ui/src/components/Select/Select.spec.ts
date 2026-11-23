import { type Page, type StoryId, expect, storyTest } from "@construkt-kit/story-kit/test";

import { sheetOverlayCases } from "../sheetFrame.cases";

const triggerOf = (page: Page, story: StoryId) => {
  const query = sheetOverlayCases.find((overlay) => overlay.story === story)?.trigger.desktop;
  if (!query) throw new Error(`${story} has no case in sheetOverlayCases.`);
  return page.getByRole(query.role, { name: query.name });
};

storyTest(
  ["components-select--default"],
  "a keyboard pick returns focus to the trigger with its ring",
  async ({ page, id }) => {
    const triggerId = await triggerOf(page, id).getAttribute("id");
    const trigger = page.locator(`[id="${triggerId}"]`);
    await trigger.click();
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocusVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-select--default"],
  "a pointer pick returns focus to the trigger without its ring",
  async ({ page, id }) => {
    const triggerId = await triggerOf(page, id).getAttribute("id");
    const trigger = page.locator(`[id="${triggerId}"]`);
    await trigger.click();

    await page.getByRole("option").first().click();

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await expect(trigger).not.toBeFocusVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-applyselect--default", "components-tagselect--default"],
  "opening the list focuses its search",
  async ({ gallery, page, id }) => {
    await gallery.press(triggerOf(page, id));

    await expect(page.getByRole("textbox", { name: "Search..." })).toBeFocused();
  },
  { only: "desktop" },
);

storyTest(
  ["components-select--invalid-field"],
  "a press on the Field's label focuses the trigger without opening it",
  async ({ gallery, page }) => {
    const trigger = page.getByRole("button", { name: "Fruit Select fruit" });

    await gallery.press(page.getByText("Fruit", { exact: true }));

    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
);
