import type { BreakpointToken } from "@construkt-kit/styled-system/tokens";
import { token } from "@construkt-kit/styled-system/tokens";

/** Responsive breakpoint keys, aligned with the Panda tokens in @construkt-kit/preset. */
export type Breakpoint = BreakpointToken;

/** A breakpoint key, or the implicit `base` (no media query). */
export type BreakpointOrBase = "base" | Breakpoint;

/** A value that can vary per breakpoint. */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointOrBase, T>>;

// Keyed by Breakpoint so a token added to the preset fails to compile until it is ordered here.
const breakpointOrder = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
} satisfies Record<Breakpoint, number>;

/** Non-base breakpoints, ascending. */
export const breakpoints: readonly Breakpoint[] = (
  Object.keys(breakpointOrder) as Breakpoint[]
).sort((a, b) => breakpointOrder[a] - breakpointOrder[b]);

/** Min-width of a breakpoint as a CSS length (e.g. "768px"), from the generated tokens. */
export const breakpointMinWidth = (bp: Breakpoint): string => token(`breakpoints.${bp}`);

/** Min-width (px, numeric) of a breakpoint, from the generated tokens. */
export const breakpointPx = (bp: Breakpoint): number => Number.parseFloat(breakpointMinWidth(bp));

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
      rules.push(
        `@media (min-width: ${breakpointMinWidth(bp)}) { ${selector} { ${property}: ${values[bp]} } }`,
      );
    }
  }
  return rules.join("");
};
