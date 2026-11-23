import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-radiocard--default"],
  "a press on the group's label focuses its checked radio",
  async ({ gallery, page }) => {
    await gallery.press(page.getByText("Select a plan"));
    await expect(page.getByRole("radio", { name: "Starter" })).toBeFocused();
  },
);
