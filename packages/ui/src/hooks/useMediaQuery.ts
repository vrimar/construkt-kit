import { token } from "@construkt-kit/styled-system/tokens";
import { useSyncExternalStore } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Min-width (px) of a breakpoint, read from the generated Panda tokens. */
const breakpointPx = (bp: Breakpoint): number => Number.parseFloat(token(`breakpoints.${bp}`));

/**
 * Subscribe to a CSS media query. SSR-safe via `useSyncExternalStore` — the
 * server snapshot returns `false` (assumes desktop), so a component that
 * branches on this briefly switches after mount on mobile.
 */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

/** `true` at or above `bp`'s min-width. */
export const useBreakpointUp = (bp: Breakpoint): boolean =>
  useMediaQuery(`(min-width: ${breakpointPx(bp)}px)`);

/**
 * `true` below `bp` — the complement of {@link useBreakpointUp}. The `- 0.02`
 * closes the sub-pixel gap so up/down never both match at fractional widths.
 */
export const useBreakpointDown = (bp: Breakpoint): boolean =>
  useMediaQuery(`(max-width: ${breakpointPx(bp) - 0.02}px)`);

/** `true` below the `md` breakpoint — the design system's base↔md mobile split. */
export const useIsMobile = (): boolean => useBreakpointDown("md");
