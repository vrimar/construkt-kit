import type { Page } from "@playwright/test";

const TRANSITIONING = "[data-starting-style], [data-ending-style]";

/**
 * Waits until no kit overlay is still opening or closing, then two frames, so focus has moved back.
 */
export async function overlaysSettled(page: Page): Promise<void> {
  await page.locator(TRANSITIONING).first().waitFor({ state: "detached" });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/** Presses Escape `times` times, letting the overlays settle after each, so each press closes one layer. */
export async function pressEscape(page: Page, times = 1): Promise<void> {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press("Escape");
    await overlaysSettled(page);
  }
}
