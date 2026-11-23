import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-dialog-deletedialog--default"],
  "opens on Cancel, so Enter cancels instead of deleting",
  async ({ gallery, page }) => {
    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await gallery.calls("onSubmit")).toEqual([]);
    expect(await gallery.calls("onClose")).toHaveLength(1);
  },
);
