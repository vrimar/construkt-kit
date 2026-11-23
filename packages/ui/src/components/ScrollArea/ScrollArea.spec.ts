import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";

const parts = (page: Page) => ({
  viewport: page.locator("[data-slot=viewport]").first(),
  content: page.locator("[data-slot=content]").first(),
  scrollbar: (orientation: "vertical" | "horizontal") =>
    page.locator(`[data-slot=scrollbar][data-orientation=${orientation}]`).first(),
  verticalThumb: page.locator("[data-slot=thumb][data-orientation=vertical]").first(),
});

const scrollTop = (page: Page) => parts(page).viewport.evaluate((viewport) => viewport.scrollTop);

storyTest(
  ["components-scrollarea--default"],
  "overflows horizontally once its content grows past the viewport",
  async ({ gallery, page }) => {
    const { viewport, content, scrollbar } = parts(page);
    await expect(viewport).not.toHaveAttribute("data-overflow-x");

    await gallery.resizeTo(content.locator("> *"), 600);

    await expect(viewport).toHaveAttribute("data-overflow-x");
    await expect(scrollbar("horizontal")).toBeVisible();
  },
);

storyTest(
  ["components-scrollarea--default"],
  "a thumb drag keeps scrolling after the pointer leaves the thumb",
  async ({ page }) => {
    const { viewport, verticalThumb } = parts(page);
    await verticalThumb.hover();
    const box = await verticalThumb.boundingBox();
    if (!box) throw new Error("The vertical thumb has no box to drag.");

    await page.mouse.down();
    await page.mouse.move(box.x - 80, box.y + box.height / 2 + 400, { steps: 8 });
    await page.mouse.up();

    await expect(viewport).toHaveAttribute("data-at-bottom");
  },
  { only: "desktop" },
);

storyTest(
  ["components-scrollarea--default"],
  "a wheel over the scrollbar scrolls the viewport",
  async ({ page }) => {
    await parts(page).scrollbar("vertical").hover();

    await page.mouse.wheel(0, 120);

    await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  },
  { only: "desktop" },
);
