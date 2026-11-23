import { TIMER_SLACK_MS, expect, storyTest } from "@construkt-kit/story-kit/test";

import { HOVER_CARD_OPEN_DELAY } from "./hoverCardDelays";

storyTest(
  ["components-hovercard--default"],
  "a press inside the card keeps it open after its trigger took focus",
  async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Hover me" });
    await trigger.click();
    await expect(trigger).toBeFocused();
    const body = page.getByText("This card appears on hover.");
    await expect(body).toBeVisible();

    await body.click();

    await expect(trigger).toHaveAttribute("data-open");
  },
  { only: "desktop" },
);

storyTest(
  ["components-hovercard--default"],
  "keyboard focus on the trigger opens the card",
  async ({ page }) => {
    await page.keyboard.press("Tab");

    await expect(page.getByRole("button", { name: "Hover me" })).toBeFocused();
    await expect(page.getByText("This card appears on hover.")).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-hovercard--default"],
  "a tap on the trigger leaves the card closed",
  async ({ gallery, page }) => {
    const trigger = page.getByRole("button", { name: "Hover me" });

    await gallery.press(trigger);
    await page.waitForTimeout(HOVER_CARD_OPEN_DELAY + TIMER_SLACK_MS);

    await expect(trigger).toHaveAttribute("data-closed");
    await expect(page.getByText("This card appears on hover.")).toBeHidden();
  },
  { only: "phone" },
);
