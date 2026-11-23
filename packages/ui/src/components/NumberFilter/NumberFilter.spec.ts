import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-numberfilter--default"],
  "switching to and from between keeps focus on the operator",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Equals" }));
    await gallery.press(page.getByRole("menuitemradio", { name: /Between/ }));
    await expect(page.getByRole("button", { name: "Between" })).toBeFocused();
    await gallery.press(page.getByRole("button", { name: "Between" }));
    await gallery.press(page.getByRole("menuitemradio", { name: /Equals/ }));
    await expect(page.getByRole("button", { name: "Equals" })).toBeFocused();
  },
);
