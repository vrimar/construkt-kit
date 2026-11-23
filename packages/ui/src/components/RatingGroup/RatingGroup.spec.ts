import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-ratinggroup--default"],
  "arrows, Home and End move the rating and focus together",
  async ({ page }) => {
    const star = (count: number) => page.getByRole("radio", { name: `${count} stars` });

    await star(3).focus();
    await page.keyboard.press("ArrowRight");
    await expect(star(4)).toBeFocused();
    await expect(star(4)).toBeChecked();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(star(2)).toBeFocused();
    await expect(star(2)).toBeChecked();
    await page.keyboard.press("End");
    await expect(star(5)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(star(1)).toBeFocused();
    await expect(star(1)).toBeChecked();
  },
  { only: "desktop" },
);
