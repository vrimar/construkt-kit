const nan = (value: number) => (Number.isNaN(value) ? 0 : value);

export const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(nan(value), min), max);

export const isValueAtMax = (value: number, max: number) => nan(value) >= max;

export const isValueAtMin = (value: number, min: number) => nan(value) <= min;

export const isValueWithinRange = (value: number, min: number, max: number) =>
  nan(value) >= min && nan(value) <= max;

export function roundToStepPrecision(value: number, step: number) {
  const text = step.toString();
  const point = text.indexOf(".");
  const precision = point >= 0 ? text.length - point : 0;
  if (precision === 0) return value;
  const power = 10 ** precision;
  return Math.round(value * power) / power;
}

/** `value` on the nearest step from `min`, kept within `min` and `max`. */
export function snapValueToStep(value: number, min: number, max: number, step: number) {
  const remainder = (value - min) % step;
  let snapped =
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder;
  snapped = roundToStepPrecision(snapped, step);

  if (!Number.isNaN(min) && snapped < min) {
    snapped = min;
  } else if (!Number.isNaN(max) && snapped > max) {
    const stepsInRange = Math.floor((max - min) / step);
    const largestValidStep = min + stepsInRange * step;
    snapped = stepsInRange <= 0 || largestValidStep < min ? max : largestValidStep;
  }
  return roundToStepPrecision(snapped, step);
}

function countDecimals(value: number) {
  if (!Number.isFinite(value)) return 0;
  let scale = 1;
  let decimals = 0;
  while (Math.round(value * scale) / scale !== value) {
    scale *= 10;
    decimals += 1;
  }
  return decimals;
}

function decimalOp(a: number, sign: 1 | -1, b: number) {
  if (a % 1 === 0 && b % 1 === 0) return a + sign * b;
  const multiplier = 10 ** Math.max(countDecimals(a), countDecimals(b));
  return (Math.round(a * multiplier) + sign * Math.round(b * multiplier)) / multiplier;
}

/** `value + step` without floating-point drift; `NaN` counts as 0. */
export const incrementValue = (value: number, step: number) => decimalOp(nan(value), 1, step);

/** `value - step` without floating-point drift; `NaN` counts as 0. */
export const decrementValue = (value: number, step: number) => decimalOp(nan(value), -1, step);

const PAGE_KEYS = new Set(["PageUp", "PageDown"]);
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/** The step a key moves by: `smallStep` with Alt and an arrow, `largeStep` with Page keys or Shift and an arrow. */
export function getEventStepValue(
  event: { key: string; shiftKey: boolean; altKey: boolean },
  { step, largeStep, smallStep }: { step: number; largeStep: number; smallStep?: number },
) {
  const arrow = ARROW_KEYS.has(event.key);
  if (smallStep != null && event.altKey && arrow) return smallStep;
  return PAGE_KEYS.has(event.key) || (event.shiftKey && arrow) ? largeStep : step;
}

export const isModifierKey = (event: { ctrlKey: boolean; altKey: boolean; metaKey: boolean }) =>
  event.ctrlKey || event.altKey || event.metaKey;
