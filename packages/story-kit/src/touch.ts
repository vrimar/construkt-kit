import type { Locator, Page } from "@playwright/test";

const STEPS = 10;

export interface TouchDragOptions {
  /** How long the finger holds still at the end before lifting, so a swipe ends by where it let go, not its speed. */
  holdMs?: number;
  /** Runs while the finger is still down, after the hold. */
  whileHeld?: () => Promise<void>;
}

/** Drags one real touch `dx`, `dy` px from the middle of `target` in ten steps, then lifts it. */
export async function touchDrag(
  page: Page,
  target: Locator,
  dx: number,
  dy: number,
  { holdMs = 0, whileHeld }: TouchDragOptions = {},
): Promise<void> {
  const box = await target.boundingBox();
  if (!box) throw new Error("touchDrag: the target has no box.");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", step: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" ? [] : [{ x: x + (dx * step) / STEPS, y: y + (dy * step) / STEPS }],
    });
  try {
    await touch("touchStart", 0);
    for (let step = 1; step <= STEPS; step++) await touch("touchMove", step);
    if (holdMs > 0) await page.waitForTimeout(holdMs);
    await whileHeld?.();
    await touch("touchEnd", STEPS);
  } finally {
    await cdp.detach();
  }
}
