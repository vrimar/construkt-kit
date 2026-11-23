import type { Locator, Page } from "@playwright/test";

export interface Point {
  x: number;
  y: number;
}

/**
 * `native` for HTML drag and drop (pragmatic-drag-and-drop, `draggable`), `pointer` for drags built
 * on pointer events (`usePointerDrag`, grid grips).
 */
export type DragKind = "native" | "pointer";

export interface DragOptions {
  kind: DragKind;
  /** Where to press, from the source's top-left; its middle by default. */
  position?: Point;
}

export interface MoveOptions {
  /** Where to point, from the target's top-left; its middle by default. */
  position?: Point;
  /** Waits for this to be visible after the move: what the page shows when the target takes the drag. */
  until?: Locator;
}

export interface Drag {
  /** Moves over `target` with the button held. */
  moveTo(target: Locator, options?: MoveOptions): Promise<void>;
  /** Lets go where the pointer is. */
  drop(): Promise<void>;
  /**
   * Ends the drag without landing. A pointer drag takes Escape; a native drag can't be cancelled
   * from the keyboard in every engine, so it lets go over `away`, a place that takes nothing.
   */
  cancel(away?: Locator): Promise<void>;
}

const START_STEPS = 5;
const MOVE_STEPS = 10;
/** Past every kit drag threshold, so the move starts the drag before it heads for a target. */
const START_DISTANCE = 12;

async function pointIn(locator: Locator, position?: Point): Promise<Point> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`The drag point ${locator.toString()} has no box.`);
  return position
    ? { x: box.x + position.x, y: box.y + position.y }
    : { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Presses on `source` and starts dragging it. Chromium and WebKit fire a native drag's `dragover`
 * one mouse move late, so every native move ends with a 1px nudge that delivers it.
 */
export async function startDrag(page: Page, source: Locator, options: DragOptions): Promise<Drag> {
  const { kind } = options;
  const at = await pointIn(source, options.position);
  let pointer = at;

  const move = async (to: Point, steps: number) => {
    await page.mouse.move(to.x, to.y, { steps });
    if (kind === "native") await page.mouse.move(to.x + 1, to.y + 1);
    pointer = to;
  };

  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await move({ x: at.x + START_DISTANCE, y: at.y + START_DISTANCE / 2 }, START_STEPS);

  return {
    async moveTo(target, { position, until } = {}) {
      await move(await pointIn(target, position), MOVE_STEPS);
      await until?.waitFor({ state: "visible" });
    },
    async drop() {
      await page.mouse.move(pointer.x, pointer.y);
      await page.mouse.up();
    },
    async cancel(away) {
      if (kind === "pointer") {
        await page.keyboard.press("Escape");
        await page.mouse.up();
        return;
      }
      if (!away) throw new Error("Cancelling a native drag needs a place that takes nothing.");
      await move(await pointIn(away), MOVE_STEPS);
      await page.mouse.up();
    },
  };
}

/** Drags `source` onto `target` and lets go there. */
export async function dragTo(
  page: Page,
  source: Locator,
  target: Locator,
  options: DragOptions & { target?: MoveOptions },
): Promise<void> {
  const drag = await startDrag(page, source, options);
  await drag.moveTo(target, options.target);
  await drag.drop();
}

const TOUCH_STEPS = 10;

export interface TouchDragOptions {
  /** How long the finger holds still at the end before lifting, so a swipe ends by where it let go, not its speed. */
  holdMs?: number;
  /** Runs while the finger is still down, after the hold. */
  whileHeld?: () => Promise<void>;
}

/**
 * Drags one real touch `dx`, `dy` px from the middle of `target` in ten steps, then lifts it. Real
 * touches go through the DevTools protocol, so this runs in Chromium only.
 */
export async function touchDrag(
  page: Page,
  target: Locator,
  dx: number,
  dy: number,
  { holdMs = 0, whileHeld }: TouchDragOptions = {},
): Promise<void> {
  const engine = page.context().browser()?.browserType().name();
  if (engine !== "chromium") throw new Error(`touchDrag needs Chromium, not ${engine}.`);
  const box = await target.boundingBox();
  if (!box) throw new Error("touchDrag: the target has no box.");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", step: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd"
          ? []
          : [{ x: x + (dx * step) / TOUCH_STEPS, y: y + (dy * step) / TOUCH_STEPS }],
    });
  try {
    await touch("touchStart", 0);
    for (let step = 1; step <= TOUCH_STEPS; step++) await touch("touchMove", step);
    if (holdMs > 0) await page.waitForTimeout(holdMs);
    await whileHeld?.();
    await touch("touchEnd", TOUCH_STEPS);
  } finally {
    await cdp.detach();
  }
}
