import type {} from "@vitest/browser-playwright";
import type { BrowserCommand, BrowserCommandContext } from "vitest/node";

async function swipe(
  context: BrowserCommandContext,
  selector: string,
  dx: number,
  dy: number,
  holdMs: number,
) {
  const box = await (await context.frame()).locator(selector).boundingBox();
  if (!box) throw new Error(`touchSwipe: ${selector} is not visible`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await context.page.context().newCDPSession(context.page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", step: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" ? [] : [{ x: x + (dx * step) / 10, y: y + (dy * step) / 10 }],
    });
  await touch("touchStart", 0);
  for (let step = 1; step <= 10; step++) await touch("touchMove", step);
  await context.page.waitForTimeout(holdMs);
  await touch("touchEnd", 10);
  await cdp.detach();
}

/** A real touch that moves `dy` px down from the middle of `selector` and holds still before lifting. */
const touchSwipe: BrowserCommand<[selector: string, dy: number, holdMs: number], void> = (
  context,
  selector,
  dy,
  holdMs,
) => swipe(context, selector, 0, dy, holdMs);

/** A real touch that moves `dx` px right from the middle of `selector` and holds still before lifting. */
const touchSwipeX: BrowserCommand<[selector: string, dx: number, holdMs: number], void> = (
  context,
  selector,
  dx,
  holdMs,
) => swipe(context, selector, dx, 0, holdMs);

export const commands = { touchSwipe, touchSwipeX };
