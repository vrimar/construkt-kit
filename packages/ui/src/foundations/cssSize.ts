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
