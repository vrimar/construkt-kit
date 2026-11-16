import type {} from "@vitest/browser-playwright";
import type { BrowserCommand } from "vitest/node";

const positions = new Map<string, { x: number; y: number }>();

const pressOn: BrowserCommand<[selector: string], void> = async (context, selector) => {
  const box = await (await context.frame()).locator(selector).boundingBox();
  if (!box) throw new Error(`pressOn: ${selector} is not visible`);
  const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  positions.set(context.sessionId, at);
  await context.page.mouse.move(at.x, at.y);
  await context.page.mouse.down();
};

const moveBy: BrowserCommand<[dx: number, dy: number], void> = async (context, dx, dy) => {
  const from = positions.get(context.sessionId) ?? { x: 0, y: 0 };
  const at = { x: from.x + dx, y: from.y + dy };
  positions.set(context.sessionId, at);
  await context.page.mouse.move(at.x, at.y, { steps: 4 });
};

const release: BrowserCommand<[], void> = async (context) => {
  await context.page.mouse.up();
};

const touchDrag: BrowserCommand<[selector: string, dx: number, dy: number], void> = async (
  context,
  selector,
  dx,
  dy,
) => {
  const box = await (await context.frame()).locator(selector).boundingBox();
  if (!box) throw new Error(`touchDrag: ${selector} is not visible`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await context.page.context().newCDPSession(context.page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", px: number, py: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x: px, y: py }],
    });
  await touch("touchStart", x, y);
  for (let step = 1; step <= 10; step++) {
    await touch("touchMove", x + (dx * step) / 10, y + (dy * step) / 10);
  }
  await touch("touchEnd", x + dx, y + dy);
  await cdp.detach();
};

export const commands = { pressOn, moveBy, release, touchDrag };
