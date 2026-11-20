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

/** Whether `key` opens a nested list from an item of a vertical one. */
export const isCrossOrientationOpenKey = (key: string, rtl: boolean): boolean =>
  key === (rtl ? "ArrowLeft" : "ArrowRight");

/** Whether `key` closes a nested vertical list back to the item that opened it. */
export const isCrossOrientationCloseKey = (key: string, rtl: boolean): boolean =>
  key === (rtl ? "ArrowRight" : "ArrowLeft");

function offsetWithin(ancestor: HTMLElement, element: HTMLElement) {
  let offset = 0;
  for (let node = element; node.offsetParent; node = node.offsetParent as HTMLElement) {
    offset += node.offsetTop;
    if (node.offsetParent === ancestor) break;
  }
  return offset;
}

/** Scrolls `container` the least distance that shows all of `element`, honouring scroll margins and padding. */
export function scrollIntoViewIfNeeded(
  container: HTMLElement | null,
  element: HTMLElement | null,
): void {
  if (!container || !element || container.clientHeight >= container.scrollHeight) return;
  const top = offsetWithin(container, element);
  const containerStyles = getComputedStyle(container);
  const elementStyles = getComputedStyle(element);
  const paddingTop = parseFloat(containerStyles.scrollPaddingTop) || 0;
  const paddingBottom = parseFloat(containerStyles.scrollPaddingBottom) || 0;
  const marginTop = parseFloat(elementStyles.scrollMarginTop) || 0;
  const marginBottom = parseFloat(elementStyles.scrollMarginBottom) || 0;
  const bottom = top + element.offsetHeight + marginBottom;

  let targetY = container.scrollTop;
  if (top - marginTop < container.scrollTop + paddingTop) {
    targetY = top - marginTop - paddingTop;
  } else if (bottom > container.scrollTop + container.clientHeight - paddingBottom) {
    targetY = bottom - container.clientHeight + paddingBottom;
  }
  container.scrollTo({ top: targetY, behavior: "auto" });
}
