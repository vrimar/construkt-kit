import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-treeview--basic"])) {
  test(
    `${id} arrows open and enter a branch, return to its parent and close it`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const branch = (name: string) => page.getByRole("button", { name, exact: true });
      const node = (name: string) => page.getByRole("treeitem", { name, exact: true });

      await branch("src").focus();
      await page.keyboard.press("ArrowDown");
      await expect(branch("components")).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(node("components")).toHaveAttribute("aria-expanded", "false");
      await expect(branch("components")).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(branch("src")).toBeFocused();

      await page.keyboard.press("ArrowRight");
      await expect(branch("components")).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(node("components")).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("ArrowRight");
      await expect(node("Button.tsx")).toBeFocused();

      await page.keyboard.press("End");
      await expect(branch("config")).toBeFocused();
      await page.keyboard.press("*");
      await expect(node("docs")).toHaveAttribute("aria-expanded", "true");
      await expect(node("config")).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Home");
      await expect(branch("src")).toBeFocused();
    },
  );

  test(
    `${id} typeahead moves on from the focused row and wraps`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "src", exact: true }).focus();

      await page.keyboard.press("d");
      await expect(page.getByRole("treeitem", { name: "Dialog.tsx" })).toBeFocused();
      await page.keyboard.press("d");
      await expect(page.getByRole("button", { name: "docs", exact: true })).toBeFocused();
      await page.keyboard.press("d");
      await expect(page.getByRole("treeitem", { name: "Dialog.tsx" })).toBeFocused();
    },
  );
}
