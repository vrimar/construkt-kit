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

export const commands = { pressOn, moveBy, release };
