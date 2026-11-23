import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { selectSegment } from "./segmentGroup";

storyTest(
  ["components-segmentgroup--default"],
  "selectSegment selects the item holding the named radio",
  async ({ page }) => {
    await selectSegment(page, "Angular");

    await expect(page.getByRole("radio", { name: "Angular" })).toBeChecked();
  },
);
