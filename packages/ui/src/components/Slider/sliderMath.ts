import {
  clampValue,
  getValuePercent,
  isValueWithinRange,
  snapValueToStep,
} from "@construkt-kit/utils";

export type ThumbCollisionBehavior = "none" | "push" | "swap";

export interface ValueRange {
  min: number;
  max: number;
  value: number;
}

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
  minStepsBetweenThumbs: number;
}

export const getValueRanges = (
  values: number[],
  min: number,
  max: number,
  gap: number,
): ValueRange[] =>
  values.map((value, index) => ({
    min: index === 0 ? min : values[index - 1] + gap,
    max: index === values.length - 1 ? max : values[index + 1] - gap,
    value,
  }));

const thumbGap = (bounds: SliderBounds) => bounds.step * bounds.minStepsBetweenThumbs;

/** Snaps and clamps each value to its step and its neighbours, as a controlled or default value is read. */
export function normalizeValues(values: number[], bounds: SliderBounds) {
  const { min, max, step } = bounds;
  return getValueRanges(values, min, max, thumbGap(bounds)).map((range) => {
    const snapped = clampValue(
      snapValueToStep(range.value, range.min, range.max, step),
      range.min,
      range.max,
    );
    if (!isValueWithinRange(snapped, min, max)) {
      throw new Error(
        "Slider: the configured `min`, `max`, `step` or `minStepsBetweenThumbs` are invalid.",
      );
    }
    return snapped;
  });
}

export const getRangeAtIndex = (values: number[], index: number, bounds: SliderBounds) =>
  getValueRanges(values, bounds.min, bounds.max, thumbGap(bounds))[index];

export const setValueAtIndex = (values: number[], index: number, value: number) =>
  values[index] === value ? values : [...values.slice(0, index), value, ...values.slice(index + 1)];

/** The values after one step of the thumb at `index` toward `max` (`direction` 1) or `min` (-1). */
export function stepThumb(
  values: number[],
  index: number,
  direction: 1 | -1,
  step: number,
  bounds: SliderBounds,
) {
  const range = getRangeAtIndex(values, index, bounds);
  const lower = index === 0 ? range.min : values[index - 1];
  const upper = index === values.length - 1 ? range.max : values[index + 1];
  const next = values.slice();
  next[index] = snapValueToStep(values[index] + direction * step, lower, upper, step);
  next[index] = clampValue(next[index], range.min, range.max);
  return next;
}

const round = (value: number) => Math.round(value * 1e10) / 1e10;

interface Collision {
  index: number;
  value: number;
  values: number[];
  bounds: SliderBounds;
}

function collideNone({ index, value, values: current, bounds }: Collision) {
  const range = getRangeAtIndex(current, index, bounds);
  const values = current.slice();
  values[index] = round(clampValue(value, range.min, range.max));
  return { values, index, swapped: false };
}

function collidePush({ index, value, values: current, bounds }: Collision) {
  const { min, max } = bounds;
  const gap = thumbGap(bounds);
  const values = current.slice();
  const absoluteMin = min + index * gap;
  const absoluteMax = max - (current.length - 1 - index) * gap;
  values[index] = round(clampValue(value, absoluteMin, absoluteMax));
  for (let i = index + 1; i < values.length; i++) {
    const lowest = values[i - 1] + gap;
    if (values[i] < lowest) values[i] = round(lowest);
  }
  for (let i = index - 1; i >= 0; i--) {
    const highest = values[i + 1] - gap;
    if (values[i] > highest) values[i] = round(highest);
  }
  return { values, index, swapped: false };
}

function collideSwap(collision: Collision, startValue: number) {
  const { index, value, values: current, bounds } = collision;
  const gap = thumbGap(bounds);
  const previous = current[index - 1];
  const next = current[index + 1];
  const crossingNext = next != null && value >= next && value > startValue;
  const crossingPrevious = previous != null && value <= previous && value < startValue;
  if (!crossingNext && !crossingPrevious) return collideNone(collision);

  const swapIndex = crossingNext ? index + 1 : index - 1;
  const values = current.slice();
  const range = getRangeAtIndex(current, swapIndex, bounds);
  values[swapIndex] = round(clampValue(value, range.min, range.max));
  values[index] = current[swapIndex];
  if (crossingNext && values[index] > values[swapIndex] - gap) {
    values[index] = round(values[swapIndex] - gap);
  } else if (crossingPrevious && values[index] < values[swapIndex] + gap) {
    values[index] = round(values[swapIndex] + gap);
  }
  return { values, index: swapIndex, swapped: true };
}

/** The values after dragging the thumb at `index` to `value`, and which thumb then has focus. */
export function resolveThumbCollision(
  behavior: ThumbCollisionBehavior,
  index: number,
  value: number,
  values: number[],
  bounds: SliderBounds,
  startValue?: number,
) {
  if (values.length === 1) {
    return { values: [round(clampValue(value, bounds.min, bounds.max))], index: 0, swapped: false };
  }
  const collision = { index, value, values, bounds };
  if (behavior === "push") return collidePush(collision);
  if (behavior === "swap") return collideSwap(collision, startValue ?? values[index]);
  return collideNone(collision);
}

/** When thumbs are stacked at `max`, the first of them, the only one that can move. */
export function selectMovableThumb(values: number[], index: number, max: number) {
  if (values[index] !== max) return index;
  let movable = index;
  while (movable > 0 && values[movable - 1] === max) movable -= 1;
  return movable;
}

/** The thumb nearest `value`, the later one on a tie. */
export function getClosestIndex(values: number[], value: number, max: number) {
  let closest = 0;
  let distance = Math.abs(values[0] - value);
  for (let i = 1; i < values.length; i++) {
    const next = Math.abs(values[i] - value);
    if (next <= distance) {
      closest = i;
      distance = next;
    }
  }
  return selectMovableThumb(values, closest, max);
}

export function getRangeOffsets(percents: number[], origin: "start" | "center" | "end") {
  const first = percents[0];
  const last = percents[percents.length - 1];
  if (percents.length === 1) {
    if (origin === "center") {
      const negative = first < 50;
      return { start: negative ? `${first}%` : "50%", end: negative ? "50%" : `${100 - first}%` };
    }
    if (origin === "end") return { start: `${last}%`, end: "0%" };
    return { start: "0%", end: `${100 - last}%` };
  }
  return { start: `${first}%`, end: `${100 - last}%` };
}

const transformer =
  ([a, b]: [number, number], [c, d]: [number, number]) =>
  (value: number) =>
    a === b || c === d ? c : c + ((d - c) / (b - a)) * (value - a);

export interface ThumbGeometry {
  min: number;
  max: number;
  vertical: boolean;
  rtl: boolean;
  contain: boolean;
  thumbSize: { width: number; height: number } | null;
}

/** Where a thumb or marker for `value` sits along the control, inset by half a thumb when contained. */
export function getThumbOffset(value: number, geometry: ThumbGeometry) {
  const { min, max, vertical, rtl, contain, thumbSize } = geometry;
  const percent = getValuePercent(value, min, max) * 100;
  if (!contain) return `${percent}%`;
  let offset: number;
  if (vertical) {
    const height = thumbSize?.height ?? 0;
    offset = parseFloat(transformer([min, max], [-height / 2, height / 2])(value).toFixed(2));
  } else {
    const width = thumbSize?.width ?? 0;
    offset = rtl
      ? -1 * parseFloat(transformer([max, min], [-width / 2, width / 2])(value).toFixed(2))
      : parseFloat(transformer([min, max], [-width / 2, width / 2])(value).toFixed(2));
  }
  return `calc(${percent}% - ${offset}px)`;
}
