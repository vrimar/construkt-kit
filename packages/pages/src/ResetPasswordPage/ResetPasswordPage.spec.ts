import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["pages-resetpasswordpage--default"],
  "keeps the password rules on screen on a phone",
  async ({ page }) => {
    await page.getByLabel("New password", { exact: true }).fill("abc");
    await expect(page.getByRole("dialog")).toBeInViewport({ ratio: 1 });
  },
  { only: "phone" },
);
