export type SwipeDirection = "up" | "down" | "left" | "right";

export const isVerticalSwipe = (direction: SwipeDirection): boolean =>
  direction === "up" || direction === "down";

/** `1` for a direction client coordinates grow towards, down or right; `-1` for up or left. */
export const swipeSign = (direction: SwipeDirection): 1 | -1 =>
  direction === "down" || direction === "right" ? 1 : -1;

/** How far a move of `x`, `y` px travels towards `direction`; negative is away from it. */
export const swipeDisplacement = (direction: SwipeDirection, x: number, y: number): number =>
  swipeSign(direction) * (isVerticalSwipe(direction) ? y : x);

/** Follows `delta` where its sign may travel, and damps it to the square root where it may not. */
export function rubberBand(delta: number, positive: boolean, negative: boolean): number {
  if (delta > 0) return positive ? delta : Math.sqrt(delta);
  return negative ? delta : -Math.sqrt(-delta);
}
