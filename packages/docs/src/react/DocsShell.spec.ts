import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["docs-docsshell--page"],
  "following a link in the menu drawer closes it on the new page",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Sharing › Roles and permissions" }));
    const drawer = page.getByRole("dialog", { name: "Documentation" });
    await expect(drawer).toBeVisible();

    await gallery.press(drawer.getByRole("link", { name: "Transfer ownership" }));

    await expect(drawer).toBeHidden();
    await expect(page.getByRole("button", { name: "More › Transfer ownership" })).toBeVisible();
  },
  { only: "phone" },
);
