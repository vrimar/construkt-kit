import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { setChecked } from "./checkable";

storyTest(
  ["components-switch--default"],
  "setChecked turns a switch on and off through its label",
  async ({ page }) => {
    const toggle = page.getByRole("checkbox", { name: "Enable notifications" });

    await setChecked(toggle, true);
    await expect(toggle).toBeChecked();
    await setChecked(toggle, false);
    await expect(toggle).not.toBeChecked();
  },
);
