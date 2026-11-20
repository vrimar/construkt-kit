import {
  type Locator,
  type Page,
  expect,
  selectStories,
  storyTags,
  test,
} from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-carousel--default"])) {
  test(
    `${id} the next trigger moves a page and reports it to onValueChange`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await gallery.press(page.getByRole("button", { name: "Next slide" }));

      await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();
      await expect(page.getByRole("group", { name: "1 of 5" })).toBeHidden();
      await expect(page.getByRole("button", { name: "Previous slide" })).toBeEnabled();
      expect(await gallery.calls("onValueChange")).toEqual([
        [1, expect.objectContaining({ reason: "next-press" })],
      ]);
    },
  );

  test(
    `${id} arrow keys and End on the indicators move a page and keep focus on its indicator`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Go to slide 1" }).focus();

      await page.keyboard.press("ArrowRight");
      await expect(page.getByRole("button", { name: "Go to slide 2" })).toBeFocused();
      await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible();

      await page.keyboard.press("End");
      await expect(page.getByRole("button", { name: "Go to slide 5" })).toBeFocused();
      await expect(page.getByRole("group", { name: "5 of 5" })).toBeVisible();
    },
  );
}

for (const id of selectStories(["components-carousel--vertical"])) {
  test(
    `${id} ArrowDown moves down a page and wraps from the last page to the first`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
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
  );
}

for (const id of selectStories(["components-carousel--autoplay"])) {
  test(
    `${id} the autoplay trigger advances the slides, which hold while the pointer is over them`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("group", { name: "1 of 5" }).hover();
      await page.getByRole("button", { name: "Start slide rotation" }).focus();

      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Stop slide rotation" })).toBeVisible();
      await page.waitForTimeout(5000);
      await expect(page.getByRole("group", { name: "1 of 5" })).toBeVisible();

      await page.mouse.move(0, 0);
      await expect(page.getByRole("group", { name: "2 of 5" })).toBeVisible({ timeout: 6000 });
    },
  );

  test(
    `${id} a finger held while the slides advance, or a tap, keeps autoplay on and a swipe stops it`,
    { tag: [...storyTags(id), "@phone-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const slides = page.locator("[data-slot=itemGroup]");
      const stop = page.getByRole("button", { name: "Stop slide rotation" });
      await gallery.press(page.getByRole("button", { name: "Start slide rotation" }));

      const finger = await touchDown(page, slides);
      await slides.evaluate(
        (element) =>
          new Promise<void>((resolve) =>
            element.addEventListener("scroll", () => resolve(), { once: true }),
          ),
      );
      await page.waitForTimeout(600);
      await finger.lift();
      await expect(stop).toBeVisible();

      await gallery.press(slides);
      await page.waitForTimeout(300);
      await expect(stop).toBeVisible();

      const swipe = await touchDown(page, slides);
      await swipe.move(-150);
      await swipe.lift();
      await expect(page.getByRole("button", { name: "Start slide rotation" })).toBeVisible();
    },
  );
}

async function touchDown(page: Page, target: Locator) {
  const box = await target.boundingBox();
  if (!box) throw new Error("There is nothing to touch.");
  let x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", at?: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: at === undefined ? [] : [{ x: at, y }],
    });
  await touch("touchStart", x);
  return {
    async move(dx: number) {
      for (let step = 1; step <= 10; step++) await touch("touchMove", x + (dx * step) / 10);
      x += dx;
    },
    async lift() {
      await touch("touchEnd");
      await cdp.detach();
    },
  };
}
