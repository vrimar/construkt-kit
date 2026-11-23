import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { dismissToast, toast } from "./toast";

storyTest(
  ["components-toast--stacked"],
  "dismissToast dismisses a toast without a close button and leaves the rest",
  async ({ page }) => {
    await dismissToast(toast(page, "Changes saved"));

    await expect(toast(page, "Changes saved")).toBeHidden();
    await expect(toast(page, "Upload failed")).toBeVisible();
  },
);
