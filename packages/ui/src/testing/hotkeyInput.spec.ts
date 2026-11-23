import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { hotkeyError, hotkeyInput } from "./hotkeyInput";

storyTest(
  ["components-hotkeyinput--default"],
  "hotkeyInput finds the control by its label and hotkeyError reads its refusal",
  async ({ page }) => {
    const input = hotkeyInput(page, "Undo");
    await input.click();
    await expect(input).toHaveAccessibleName(/Press keys/);
    await page.keyboard.press("Control+K");
    await expect(hotkeyError(input)).toBeVisible();
  },
  { only: "desktop" },
);
