import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-slider--range"])) {
  test(
    `${id} Home stops a thumb at its neighbour and Page Up steps by the large step`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const [low, high] = [page.getByRole("slider").nth(0), page.getByRole("slider").nth(1)];

      await high.focus();
      await page.keyboard.press("Home");
      await expect(high).toHaveAttribute("aria-valuenow", "25");
      await low.focus();
      await page.keyboard.press("Home");
      await expect(low).toHaveAttribute("aria-valuenow", "0");
      await page.keyboard.press("PageUp");
      await expect(low).toHaveAttribute("aria-valuenow", "10");
      await page.keyboard.press("ArrowRight");
      await expect(low).toHaveAttribute("aria-valuenow", "11");
    },
  );

  test(
    `${id} a press on the track moves the nearest thumb to it`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const control = page.locator("[data-slot=control]");
      const box = await control.boundingBox();
      if (!box) throw new Error("The slider control has no box.");

      await control.click({ position: { x: box.width * 0.9, y: box.height / 2 } });
      await expect(page.getByRole("slider").nth(1)).toHaveAttribute("aria-valuenow", "90");
      await expect(page.getByRole("slider").nth(0)).toHaveAttribute("aria-valuenow", "25");
      await expect(page.getByRole("slider").nth(1)).toBeFocused();
    },
  );
}
