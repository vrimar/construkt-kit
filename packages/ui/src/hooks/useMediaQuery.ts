import { useSyncExternalStore } from "react";

import {
  type Breakpoint,
  breakpointDownQuery,
  breakpointUpQuery,
} from "../foundations/breakpoints";
import { getMediaQueryList } from "./mediaQueryList";

/**
 * Subscribe to a CSS media query. SSR-safe via `useSyncExternalStore` — the
 * server snapshot returns `false` (assumes desktop), so a component that
 * branches on this briefly switches after mount on mobile. Environments
 * without `matchMedia` (jsdom) also read `false`.
 */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const mql = getMediaQueryList(query);
      mql?.addEventListener("change", onChange);
      return () => mql?.removeEventListener("change", onChange);
    },
    () => getMediaQueryList(query)?.matches ?? false,
    () => false,
  );

/** `true` at or above `bp`'s min-width. */
export const useBreakpointUp = (bp: Breakpoint): boolean => useMediaQuery(breakpointUpQuery(bp));

/** `true` below `bp` — the complement of {@link useBreakpointUp}. */
export const useBreakpointDown = (bp: Breakpoint): boolean =>
  useMediaQuery(breakpointDownQuery(bp));

/** `true` below the `md` breakpoint — the design system's base↔md mobile split. */
export const useIsMobile = (): boolean => useBreakpointDown("md");
