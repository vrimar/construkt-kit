import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";

async function restingContent(page: Page) {
  await page.waitForFunction(
    () => document.querySelector("dialog [data-slot=content]")?.getAnimations().length === 0,
  );
  const content = page.locator("dialog [data-slot=content]");
  const box = await content.boundingBox();
  if (!box) throw new Error("The drawer's content has no box.");
  return { content, box };
}

const backdropOpacity = (page: Page) =>
  page.locator("dialog").evaluate((dialog) => getComputedStyle(dialog, "::backdrop").opacity);

storyTest(
  ["components-sheet--held-open"],
  "settles back when its owner keeps it open through a swipe away",
  async ({ gallery, page }) => {
    const { content, box } = await restingContent(page);

    await gallery.swipe(page.getByText("3 of 5 files uploaded."), 0, box.height * 0.8);

    await expect.poll(async () => (await content.boundingBox())?.y).toBe(box.y);
    expect(await backdropOpacity(page)).toBe("1");
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "swipe" })],
    ]);
  },
  { only: "phone" },
);

storyTest(
  ["components-sheet--held-open"],
  "settles back on the snap point its owner keeps",
  async ({ gallery, page }) => {
    const { content, box } = await restingContent(page);
    const viewport = page.viewportSize()?.height ?? 0;

    await gallery.swipe(
      page.getByText("3 of 5 files uploaded."),
      0,
      (box.height - viewport / 2) * 0.8,
    );

    await expect.poll(async () => (await content.boundingBox())?.y).toBe(box.y);
    expect(await gallery.calls("onSnapPointChange")).toEqual([[0.5]]);
  },
  { only: "phone" },
);

storyTest(
  ["components-drawer--right-to-left-with-scroller"],
  "swipes away from the start of a row that scrolls the same way",
  async ({ gallery, page }) => {
    const { box } = await restingContent(page);

    await gallery.swipe(page.getByText("Open", { exact: true }), -box.width * 0.8, 0);

    await expect(page.getByRole("dialog", { name: "Filters" })).toBeHidden();
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "swipe" })],
    ]);
  },
  { only: "phone" },
);

storyTest(
  ["components-drawer--default"],
  "a touch it closed during can't close it once it opens again",
  async ({ gallery, page }) => {
    const trigger = page.getByRole("button", { name: "Open Drawer" });
    await gallery.press(trigger);
    const drawer = page.getByRole("dialog", { name: "Drawer Title" });
    const body = drawer.getByText("This is the drawer body content.");
    const { box } = await restingContent(page);

    await gallery.swipe(body, box.width * 0.7, 0, {
      whileHeld: async () => {
        await page.keyboard.press("Escape");
        await expect(drawer).toBeHidden();
      },
    });
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(drawer).toBeVisible();
    await gallery.press(body);
    await page.waitForTimeout(400);

    await expect(drawer).toBeVisible();
  },
  { only: "phone" },
);
