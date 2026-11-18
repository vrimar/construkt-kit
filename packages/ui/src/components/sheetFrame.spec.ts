import {
  type Locator,
  type Page,
  expect,
  selectStories,
  storyTags,
  test,
} from "@construkt-kit/story-kit/test";

import { type RoleQuery, sheetOverlayCases } from "./sheetFrame.cases";

const locate = (page: Page, { role, name }: RoleQuery) =>
  page.getByRole(role, { name, exact: typeof name === "string" });

async function pinTrigger(page: Page, query: RoleQuery): Promise<Locator> {
  const trigger = locate(page, query).and(page.locator("[aria-expanded]"));
  const id = await trigger.getAttribute("id");
  if (!id)
    throw new Error(
      `The ${query.role} "${query.name}" has no id to follow it while a sheet hides the page.`,
    );
  return page.locator(`[id="${id}"]`);
}

for (const overlay of sheetOverlayCases) {
  if (selectStories([overlay.story]).length === 0) continue;

  test.describe(`${overlay.component} (${overlay.story})`, () => {
    test(
      "Escape right after opening closes it",
      { tag: storyTags(overlay.story) },
      async ({ gallery, page }) => {
        await gallery.open(overlay.story);
        const trigger = await pinTrigger(page, overlay.trigger[gallery.device]);
        await gallery.press(trigger);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
      },
    );

    test(
      "closing returns focus to the trigger",
      { tag: storyTags(overlay.story) },
      async ({ gallery, page }) => {
        await gallery.open(overlay.story);
        const trigger = await pinTrigger(page, overlay.trigger[gallery.device]);
        await gallery.press(trigger);
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        await page.keyboard.press("Escape");
        const focusAfterClose = overlay.focusAfterClose?.[gallery.device];
        await expect(focusAfterClose ? locate(page, focusAfterClose) : trigger).toBeFocused();
      },
    );

    test(
      "tapping outside closes the sheet",
      { tag: [...storyTags(overlay.story), "@phone-only"] },
      async ({ gallery, page }) => {
        await gallery.open(overlay.story);
        const trigger = await pinTrigger(page, overlay.trigger.phone);
        await gallery.press(trigger);
        const panel = page.locator("[data-overlay-sheet-content]");
        await expect(panel).toBeVisible();
        await panel.evaluate((element) =>
          Promise.all(
            (element.closest("[data-overlay-sheet]")?.getAnimations({ subtree: true }) ?? []).map(
              (animation) => animation.finished,
            ),
          ),
        );
        const top = (await panel.boundingBox())?.y ?? 0;
        expect(top, "the sheet leaves room above it to tap").toBeGreaterThan(8);
        await page.touchscreen.tap(8, top / 2);
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
      },
    );
  });
}
