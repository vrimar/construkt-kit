import { token } from "#styled-system/tokens";
import type { BreakpointToken } from "#styled-system/types";

/** Responsive breakpoint keys, aligned with the Panda tokens in @construkt-kit/preset. */
export type Breakpoint = BreakpointToken;

/** A breakpoint key, or the implicit `base` (no media query). */
export type BreakpointOrBase = "base" | Breakpoint;

/** A value that can vary per breakpoint. */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointOrBase, T>>;

/** Min-width of a breakpoint as a CSS length (e.g. "768px"), from the generated tokens. */
export const breakpointMinWidth = (bp: Breakpoint): string => token(`breakpoints.${bp}`);

/** Min-width (px, numeric) of a breakpoint, from the generated tokens. */
export const breakpointPx = (bp: Breakpoint): number => Number.parseFloat(breakpointMinWidth(bp));

// Keyed by Breakpoint so a token added to the preset fails to compile until it is listed here.
const breakpointKeys = {
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  "2xl": true,
} satisfies Record<Breakpoint, true>;

/** Non-base breakpoints, ascending. */
export const breakpoints: readonly Breakpoint[] = (
  Object.keys(breakpointKeys) as Breakpoint[]
).sort((a, b) => breakpointPx(a) - breakpointPx(b));

const breakpointRem = (bp: Breakpoint) => `${breakpointPx(bp) / 16}rem`;

/** Media condition at or above `bp`, the same one Panda emits for the `bp` condition. */
export const breakpointUpQuery = (bp: Breakpoint): string => `(width >= ${breakpointRem(bp)})`;

/** Media condition below `bp`, the same one Panda emits for the `<bp>Down` condition. */
export const breakpointDownQuery = (bp: Breakpoint): string => `(width < ${breakpointRem(bp)})`;

/** CSS rules setting a custom property per breakpoint for `selector` (base rule, then
 *  ascending `@media`). Emit base here, not inline — inline would beat the media rules. */
export const responsiveVarRules = (
  selector: string,
  property: `--${string}`,
  values: Partial<Record<BreakpointOrBase, string | number>>,
): string => {
  const rules: string[] = [];
  if (values.base != null) rules.push(`${selector} { ${property}: ${values.base} }`);
  for (const bp of breakpoints) {
    if (values[bp] != null) {
      rules.push(`@media ${breakpointUpQuery(bp)} { ${selector} { ${property}: ${values[bp]} } }`);
    }
  }
  return rules.join("");
};
