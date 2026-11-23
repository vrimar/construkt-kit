import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { dialog } from "./dialog";

storyTest(
  ["components-popover-confirmpopover--destructive"],
  "dialog finds a ConfirmPopover, an alertdialog, by its title",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Delete project" }));

    await expect(dialog(page, "Delete Q3 planning?")).toBeVisible();
  },
);

storyTest(
  ["components-dialog--default"],
  "dialog finds a Dialog by its title",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Open dialog" }));

    await expect(dialog(page, "Confirm action")).toBeVisible();
  },
);
