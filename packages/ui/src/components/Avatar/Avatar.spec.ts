import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-avatar--lazy-image-in-closed-section"],
  "a lazy image waiting behind its fallback loads once its section opens",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Reviewers" }));

    await expect(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    await expect(page.getByText("AL", { exact: true })).toBeHidden();
  },
);
