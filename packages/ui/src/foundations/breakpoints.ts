import { token } from "@construkt-kit/styled-system/tokens";

/** Responsive breakpoint keys, aligned with the Panda tokens in @construkt-kit/preset. */
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** A breakpoint key, or the implicit `base` (no media query). */
export type BreakpointOrBase = "base" | Breakpoint;

/** A value that can vary per breakpoint. */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointOrBase, T>>;

/** Non-base breakpoints, ascending. */
export const breakpoints: readonly Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

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
