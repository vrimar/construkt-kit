import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["docs-navtree--in-section"],
  "following a link into another section collapses the section left",
  async ({ gallery, page }) => {
    const sharing = page.getByRole("button", { name: "Sharing" });
    const projects = page.getByRole("button", { name: "Projects" });
    await expect(sharing).toHaveAttribute("aria-expanded", "true");
    await expect(projects).toHaveAttribute("aria-expanded", "false");

    await gallery.press(projects);
    await gallery.press(page.getByRole("link", { name: "Project settings" }));

    await expect(page.getByRole("link", { name: "Project settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(projects).toHaveAttribute("aria-expanded", "true");
    await expect(sharing).toHaveAttribute("aria-expanded", "false");
  },
);
