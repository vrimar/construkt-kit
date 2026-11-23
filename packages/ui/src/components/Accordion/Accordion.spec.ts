import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-accordion--default"],
  "a collapsible single accordion closes its open item and keeps one open at a time",
  async ({ gallery, page }) => {
    const region = (name: string) => page.getByRole("region", { name });

    await gallery.press(page.getByRole("button", { name: "Item 1" }));
    await expect(region("Item 1")).toBeHidden();

    await gallery.press(page.getByRole("button", { name: "Item 2" }));
    await expect(region("Item 2")).toBeVisible();
    await gallery.press(page.getByRole("button", { name: "Item 3" }));
    await expect(region("Item 3")).toBeVisible();
    await expect(region("Item 2")).toBeHidden();
  },
);

storyTest(
  ["components-accordion--default"],
  "arrow keys, Home and End move focus between the triggers and wrap",
  async ({ page }) => {
    const trigger = (name: string) => page.getByRole("button", { name });

    await trigger("Item 1").focus();
    for (const [key, name] of [
      ["ArrowDown", "Item 2"],
      ["ArrowDown", "Item 3"],
      ["ArrowDown", "Item 1"],
      ["ArrowUp", "Item 3"],
      ["Home", "Item 1"],
      ["End", "Item 3"],
    ] as const) {
      await page.keyboard.press(key);
      await expect(trigger(name)).toBeFocused();
    }
  },
  { only: "desktop" },
);

storyTest(
  ["components-accordion--multiple"],
  "a multiple accordion opens an item beside the open ones and closes an open one",
  async ({ gallery, page }) => {
    const region = (name: string) => page.getByRole("region", { name });

    await gallery.press(page.getByRole("button", { name: "Third section" }));
    for (const name of ["First section", "Second section", "Third section"]) {
      await expect(region(name)).toBeVisible();
    }

    await gallery.press(page.getByRole("button", { name: "First section" }));
    await expect(region("First section")).toBeHidden();
    await expect(region("Second section")).toBeVisible();
  },
);
