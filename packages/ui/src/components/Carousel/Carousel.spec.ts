import { TIMER_SLACK_MS, expect, storyTest } from "@construkt-kit/story-kit/test";

import { AUTOPLAY_DELAY } from "./carouselRoot";

storyTest(
  ["components-carousel--default"],
  "the next trigger moves a page and reports it to onValueChange",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Next slide" }));

    await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();
    await expect(page.getByRole("group", { name: "1 of 5" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Previous slide" })).toBeEnabled();
    expect(await gallery.calls("onValueChange")).toEqual([
      [1, expect.objectContaining({ reason: "next-press" })],
    ]);
  },
);

storyTest(
  ["components-carousel--default"],
  "arrow keys and End on the indicators move a page and keep focus on its indicator",
  async ({ page }) => {
    await page.getByRole("button", { name: "Go to slide 1" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: "Go to slide 2" })).toBeFocused();
    await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();

    await page.keyboard.press("End");
    await expect(page.getByRole("button", { name: "Go to slide 5" })).toBeFocused();
    await expect(page.getByRole("group", { name: "5 of 5" })).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-carousel--vertical"],
  "ArrowDown moves down a page and wraps from the last page to the first",
  async ({ page }) => {
    await page.locator("[data-slot='itemGroup']").focus();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute(
      "data-current",
    );
    await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();

    await page.keyboard.press("End");
    await expect(page.getByRole("group", { name: "5 of 5" })).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("group", { name: "1 of 5" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute(
      "data-current",
    );
  },
  { only: "desktop" },
);

storyTest(
  ["components-carousel--autoplay"],
  "the autoplay trigger advances the slides, which hold while the pointer is over them",
  async ({ page }) => {
    await page.getByRole("group", { name: "1 of 5" }).hover();
    await page.getByRole("button", { name: "Start slide rotation" }).focus();

    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Stop slide rotation" })).toBeVisible();
    await page.waitForTimeout(AUTOPLAY_DELAY + TIMER_SLACK_MS);
    await expect(page.getByRole("group", { name: "1 of 5" })).toBeVisible();

    await page.mouse.move(0, 0);
    await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible({
      timeout: AUTOPLAY_DELAY + 2 * TIMER_SLACK_MS,
    });
  },
  { only: "desktop" },
);

storyTest(
  ["components-carousel--autoplay"],
  "a mouse drag moves a page without clicking the slide it pressed",
  async ({ page }) => {
    const first = page.locator("[data-slot=item][data-index='0']");
    await first.evaluate((slide) =>
      slide.addEventListener("click", () => slide.setAttribute("data-clicked", "")),
    );
    const box = await first.boundingBox();
    if (!box) throw new Error("The first slide has no box to drag.");

    await first.hover({ position: { x: box.width * 0.9, y: box.height / 2 } });
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();
    await expect(first).not.toHaveAttribute("data-clicked");
  },
  { only: "desktop" },
);

storyTest(
  ["components-carousel--autoplay"],
  "a finger held while the slides advance, or a tap, keeps autoplay on and a swipe stops it",
  async ({ gallery, page }) => {
    const slides = page.locator("[data-slot=itemGroup]");
    const stop = page.getByRole("button", { name: "Stop slide rotation" });
    await gallery.press(page.getByRole("button", { name: "Start slide rotation" }));

    await gallery.swipe(slides, 0, 0, {
      whileHeld: async () => {
        await slides.evaluate(
          (element) =>
            new Promise<void>((resolve) =>
              element.addEventListener("scroll", () => resolve(), { once: true }),
            ),
        );
        await page.waitForTimeout(600);
      },
    });
    await expect(stop).toBeVisible();

    await gallery.press(slides);
    await page.waitForTimeout(300);
    await expect(stop).toBeVisible();

    await gallery.swipe(slides, -150, 0);
    await expect(page.getByRole("button", { name: "Start slide rotation" })).toBeVisible();
  },
  { only: "phone" },
);
