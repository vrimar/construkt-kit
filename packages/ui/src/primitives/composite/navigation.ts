export const isItemDisabled = (element: Element): boolean =>
  element.hasAttribute("data-disabled") ||
  element.getAttribute("aria-disabled") === "true" ||
  element.matches(":disabled");

/** The items of a list by index: how many there are and which of them navigation skips. */
export interface NavigableList {
  readonly length: number;
  isDisabled: (index: number) => boolean;
}

/** A list of item elements, disabled as `isItemDisabled` reads them. */
export const elementList = (elements: readonly Element[]): NavigableList => ({
  length: elements.length,
  isDisabled: (index) => isItemDisabled(elements[index]),
});

export const entryList = (entries: readonly { disabled: boolean }[]): NavigableList => ({
  length: entries.length,
  isDisabled: (index) => entries[index].disabled,
});

function findEnabledIndex(list: NavigableList, startingIndex: number, decrement: boolean): number {
  let index = startingIndex;
  do {
    index += decrement ? -1 : 1;
  } while (index >= 0 && index < list.length && list.isDisabled(index));
  return index >= 0 && index < list.length ? index : -1;
}

export const getFirstEnabledIndex = (list: NavigableList): number =>
  findEnabledIndex(list, -1, false);

export const getLastEnabledIndex = (list: NavigableList): number =>
  findEnabledIndex(list, list.length, true);

export interface ListStepOptions {
  /** Moves toward the start of the list. */
  decrement: boolean;
  /** Wraps from one end of the list to the other instead of stopping there. */
  loop: boolean;
}

/**
 * The index one arrow step moves the highlight to from `current`, skipping disabled items. With
 * nothing highlighted (`-1`) it lands on the first enabled item, or the last when moving up.
 */
export function getNextIndex(
  list: NavigableList,
  current: number,
  { decrement, loop }: ListStepOptions,
): number {
  if (current === -1) {
    return decrement ? getLastEnabledIndex(list) : getFirstEnabledIndex(list);
  }
  const next = findEnabledIndex(list, current, decrement);
  if (next !== -1) return next;
  if (!loop) return current;
  return decrement ? getLastEnabledIndex(list) : getFirstEnabledIndex(list);
}

export type ListTarget = "next" | "prev" | "first" | "last";

/** The index a move to `target` lands on, skipping disabled items; -1 when every item is disabled. */
export function getTargetIndex(
  list: NavigableList,
  current: number,
  target: ListTarget,
  loop: boolean,
): number {
  if (target === "first") return getFirstEnabledIndex(list);
  if (target === "last") return getLastEnabledIndex(list);
  return getNextIndex(list, current, { decrement: target === "prev", loop });
}

export type ListOrientation = "horizontal" | "vertical";

/**
 * The step an arrow key takes along a list: `1` toward its end, `-1` toward its start, `0` for a key
 * across its orientation or no arrow at all. Left and right swap in a right-to-left horizontal list.
 */
export function getArrowStep(key: string, orientation: ListOrientation, rtl: boolean): -1 | 0 | 1 {
  if (orientation === "vertical") return key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
  if (key === "ArrowRight") return rtl ? -1 : 1;
  if (key === "ArrowLeft") return rtl ? 1 : -1;
  return 0;
}

export function getKeyTarget(
  key: string,
  orientation: ListOrientation,
  rtl: boolean,
): ListTarget | null {
  if (key === "Home") return "first";
  if (key === "End") return "last";
  const step = getArrowStep(key, orientation, rtl);
  if (step === 0) return null;
  return step > 0 ? "next" : "prev";
}

export function mirrorArrowKey(key: string, rtl: boolean): string {
  if (!rtl) return key;
  if (key === "ArrowLeft") return "ArrowRight";
  if (key === "ArrowRight") return "ArrowLeft";
  return key;
}

/** Whether `key` opens a nested list from an item of a vertical one. */
export const isCrossOrientationOpenKey = (key: string, rtl: boolean): boolean =>
  key === (rtl ? "ArrowLeft" : "ArrowRight");

/** Whether `key` closes a nested vertical list back to the item that opened it. */
export const isCrossOrientationCloseKey = (key: string, rtl: boolean): boolean =>
  key === (rtl ? "ArrowRight" : "ArrowLeft");

const px = (value: string) => Number.parseFloat(value) || 0;

/**
 * Scrolls `container` the least distance that shows all of `element` inside its padding, scroll
 * padding and the element's scroll margins. Unlike `scrollIntoView`, it never scrolls the page or
 * any other ancestor.
 */
export function scrollIntoViewIfNeeded(
  container: HTMLElement | null,
  element: Element | null | undefined,
): void {
  if (!container || !element) return;
  const box = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  // Rects carry an opening animation's transform; scrollTop doesn't.
  const scale = container.offsetHeight ? box.height / container.offsetHeight : 1;
  const containerStyle = getComputedStyle(container);
  const elementStyle = getComputedStyle(element);
  const insetTop =
    px(containerStyle.paddingTop) +
    px(containerStyle.scrollPaddingTop) +
    px(elementStyle.scrollMarginTop);
  const insetBottom =
    px(containerStyle.paddingBottom) +
    px(containerStyle.scrollPaddingBottom) +
    px(elementStyle.scrollMarginBottom);
  const above = (rect.top - box.top) / scale - container.clientTop - insetTop;
  const below = above + rect.height / scale - (container.clientHeight - insetTop - insetBottom);
  if (above < 0) container.scrollTop += above;
  else if (below > 0) container.scrollTop += Math.min(below, above);
}

/** Clicks `element` with the activating key's modifiers, so a link opens where Ctrl, ⌘ or Shift ask. */
export function activateItem(
  element: HTMLElement,
  event: { altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean },
): void {
  const init: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  };
  queueMicrotask(() => element.dispatchEvent(new MouseEvent("click", init)));
}
