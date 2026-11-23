import type { Locator, Page } from "@playwright/test";

/**
 * A `HotkeyInput` by its label. It is a button named by its label and then its current value
 * ("Next question ]", or "Press keys…" while recording), so the match is on the label's start.
 */
export const hotkeyInput = (scope: Page | Locator, label: string): Locator =>
  scope.getByRole("button", {
    name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?= |$)`),
  });

/** The message a `HotkeyInput` shows while it refuses the keys just pressed. */
export const hotkeyError = (input: Locator): Locator =>
  input.locator("xpath=..").getByRole("alert");
