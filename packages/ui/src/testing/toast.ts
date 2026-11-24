import type { Locator, Page } from "@playwright/test";

import { TOAST_REGION_NAME } from "../components/Toast/toastRegion";

/** The region `<Toaster />` shows its toasts in, at either placement; Alt+T focuses it. */
export function toastRegion(page: Page): Locator {
  return page.getByRole("region", { name: TOAST_REGION_NAME });
}

/** A toast in the toaster by its title, which names it; a string title matches exactly. */
export function toast(page: Page, title: string | RegExp): Locator {
  return toastRegion(page).getByRole("status", { name: title, exact: true });
}

/**
 * Dismisses the toast `item` with Escape, which dismisses a focused toast whether or not it has a close
 * button, and waits for it to leave.
 */
export async function dismissToast(item: Locator): Promise<void> {
  await item.press("Escape");
  await item.waitFor({ state: "hidden" });
}
