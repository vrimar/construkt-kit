import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-toolbar--collapsing-labels"],
  "Tab moves through the controls of a popover opened from it",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Notes" }));
    await expect(page.getByRole("textbox", { name: "Note" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Save note" })).toBeFocused();
  },
);

storyTest(
  ["components-toolbar--collapsing-labels"],
  "collapses below its threshold and expands again",
  async ({ gallery, page }) => {
    const toolbar = page.getByRole("toolbar", { name: "Table actions" });
    const frame = page.locator("[data-resizable-frame]");
    await gallery.resizeTo(frame, 360);
    await expect(toolbar).toHaveAttribute("data-collapsed");
    await gallery.resizeTo(frame, 900);
    await expect(toolbar).not.toHaveAttribute("data-collapsed");
  },
  { only: "desktop" },
);

storyTest(
  ["components-toolbar--collapsing-labels"],
  "moves the collapsed labels' tooltip with the arrow keys",
  async ({ gallery, page }) => {
    const toolbar = page.getByRole("toolbar", { name: "Table actions" });
    await gallery.resizeTo(page.locator("[data-resizable-frame]"), 360);
    await expect(toolbar).toHaveAttribute("data-collapsed");
    await page.keyboard.press("Tab");
    await expect(toolbar.getByRole("button", { name: "Filter" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(toolbar.getByRole("button", { name: "Sort" })).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveCount(1);
    await expect(page.getByRole("tooltip")).toHaveText("Sort");
  },
  { only: "desktop" },
);

storyTest(
  ["components-toolbar--default"],
  "Tab finds the next item once CSS alone hides the tab stop",
  async ({ page }) => {
    await page.addStyleTag({
      content: "[role=toolbar] > :first-child { visibility: hidden }",
    });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("toolbar", { name: "Table actions" }).getByRole("button", { name: "Sort" }),
    ).toBeFocused();
  },
  { only: "desktop" },
);
