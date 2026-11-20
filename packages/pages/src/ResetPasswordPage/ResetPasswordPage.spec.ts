import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["pages-resetpasswordpage--default"])) {
  test(
    `${id} keeps the password rules on screen on a phone`,
    { tag: [...storyTags(id), "@phone-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByLabel("New password", { exact: true }).fill("abc");
      await expect(page.getByRole("dialog")).toBeInViewport({ ratio: 1 });
    },
  );
}
