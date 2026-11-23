import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { openPopup } from "./popup";

storyTest(
  ["components-popover--default"],
  "openPopup returns the popover its trigger opens, anchored or as a phone sheet",
  async ({ page }) => {
    const content = await openPopup(page.getByRole("button", { name: "Open Popover" }));

    await expect(content).toContainText("This is the popover body content.");
  },
);
