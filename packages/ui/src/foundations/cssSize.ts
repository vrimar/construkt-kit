import { token } from "#styled-system/tokens";
import type { Token } from "#styled-system/types";

type SizeProp = "width" | "height" | "minWidth" | "minHeight" | "maxWidth" | "maxHeight";

export const toCssSize = (value: string | number): string =>
  typeof value === "number" ? `${value}px` : token.var(`sizes.${value}` as Token, value);

// Panda can't extract runtime prop values, so plain sizes must go inline; responsive objects stay props.
export function splitInlineSizes<P extends Partial<Record<SizeProp, unknown>>>(
  props: P,
  keys: readonly SizeProp[],
): [Partial<Record<SizeProp, string>>, P] {
  const style: Partial<Record<SizeProp, string>> = {};
  const rest = { ...props };
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" || typeof value === "number") {
      style[key] = toCssSize(value);
      delete rest[key];
    }
  }
  return [style, rest];
}

const fontSizeOf = (element: Element) =>
  Number.parseFloat(getComputedStyle(element).fontSize) || 16;

/**
 * A CSS length in px: px or a bare number as is, rem by the root font size, em by `element`'s and
 * % of `percentBasis`. `null` when it isn't a number, or is a percentage without a basis.
 */
export function cssLengthToPx(
  length: string,
  element: Element,
  percentBasis?: number,
): number | null {
  const trimmed = length.trim();
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value)) return null;
  if (trimmed.endsWith("%"))
    return percentBasis === undefined ? null : (value / 100) * percentBasis;
  if (trimmed.endsWith("rem")) return value * fontSizeOf(element.ownerDocument.documentElement);
  if (trimmed.endsWith("em")) return value * fontSizeOf(element);
  return value;
}
