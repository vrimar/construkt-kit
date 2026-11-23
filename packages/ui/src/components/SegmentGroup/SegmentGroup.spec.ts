import { type Locator, expect, storyTest } from "@construkt-kit/story-kit/test";

const indicatorLeft = (indicator: Locator) =>
  indicator.evaluate((node) => (node as HTMLElement).style.getPropertyValue("--indicator-left"));

const offsetLeft = (item: Locator) =>
  item.evaluate((node) => `${(node as HTMLElement).offsetLeft}px`);

storyTest(
  ["components-segmentgroup--default"],
  "the indicator moves to the pressed item without hiding",
  async ({ gallery, page }) => {
    const indicator = page.locator('[data-slot="indicator"]');
    await indicator.evaluate((node) => {
      new MutationObserver(() => {
        if ((node as HTMLElement).hidden) node.setAttribute("data-was-hidden", "");
      }).observe(node, { attributes: true, attributeFilter: ["hidden"] });
    });

    await gallery.press(page.getByText("Angular"));

    const angular = page.locator("label", { hasText: "Angular" });
    await expect.poll(() => indicatorLeft(indicator)).toBe(await offsetLeft(angular));
    await expect(indicator).not.toHaveAttribute("data-was-hidden");
  },
);

storyTest(
  ["components-segmentgroup--default"],
  "the indicator follows the checked item when an item before it resizes",
  async ({ gallery, page }) => {
    const indicator = page.locator('[data-slot="indicator"]');
    const angular = page.locator("label", { hasText: "Angular" });
    await gallery.press(page.getByText("Angular"));
    await expect.poll(() => indicatorLeft(indicator)).toBe(await offsetLeft(angular));

    await gallery.resizeTo(page.locator("label", { hasText: "React" }), 200);

    await expect.poll(() => indicatorLeft(indicator)).toBe(await offsetLeft(angular));
  },
);
