import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-pininput--default"],
  "typing fills the first empty slot and moves on, and Backspace clears back",
  async ({ gallery, page }) => {
    const slot = (n: number) => page.getByRole("textbox", { name: `pin code ${n} of 4` });

    await gallery.press(slot(3));
    await expect(slot(1)).toBeFocused();
    await page.keyboard.type("12");
    await expect(slot(2)).toHaveValue("2");
    await expect(slot(3)).toBeFocused();

    await page.keyboard.press("Backspace");
    await expect(slot(2)).toHaveValue("");
    await expect(slot(2)).toBeFocused();
    await expect(slot(1)).toHaveValue("1");
  },
);

storyTest(
  ["components-pininput--default"],
  "a space typed into a filled numeric slot is refused",
  async ({ gallery, page }) => {
    const slot = (n: number) => page.getByRole("textbox", { name: `pin code ${n} of 4` });

    await gallery.press(slot(1));
    await page.keyboard.type("1");
    await page.keyboard.press("ArrowLeft");
    await expect(slot(1)).toBeFocused();
    await page.keyboard.press("Space");

    await expect(slot(1)).toHaveValue("1");
    await expect(slot(1)).toBeFocused();
  },
);
