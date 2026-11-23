export function isValidNumber(value: unknown): boolean {
  if (typeof value === "string") {
    const parsed = Number(value);
    return !isNaN(parsed) && isFinite(parsed) && value.trim() !== "";
  }

  return isStrictlyNumeric(value) && isFinite(value);
}

export function toInt(input: number | string | null | undefined): number {
  if (isStrictlyNumeric(input)) return Math.trunc(input);
  if (input == null) return 0;
  const parsed = Number(input);
  return isNaN(parsed) ? 0 : Math.trunc(parsed);
}

export function isStrictlyNumeric(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

const nan = (value: number) => (Number.isNaN(value) ? 0 : value);

/** `value` kept within `min` and `max`, `max` winning when they cross; `NaN` counts as 0. */
export const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(nan(value), min), max);

/** Whether `value` is at or above `max`; `NaN` counts as 0. */
export const isValueAtMax = (value: number, max: number) => nan(value) >= max;

/** Whether `value` is at or below `min`; `NaN` counts as 0. */
export const isValueAtMin = (value: number, min: number) => nan(value) <= min;

/** Whether `value` is within `min` and `max`, inclusive; `NaN` counts as 0. */
export const isValueWithinRange = (value: number, min: number, max: number) =>
  nan(value) >= min && nan(value) <= max;

/** `value` rounded to as many decimals as `step` has. */
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

/** Where `value` sits between `min` and `max`, from 0 to 1; 0 when they are equal, and `NaN` counts as 0. */
export const getValuePercent = (value: number, min: number, max: number) =>
  max === min ? 0 : (nan(value) - min) / (max - min);

/** The value at `percent` (0 to 1) of `min` to `max`, rounded to a whole `step` from `min` and clamped. */
export function getPercentValue(percent: number, min: number, max: number, step: number) {
  const value = nan(percent * (max - min) + min);
  return clampValue(Math.round((value - min) / step) * step + min, min, max);
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
