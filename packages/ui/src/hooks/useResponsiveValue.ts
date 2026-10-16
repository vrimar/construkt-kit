import { useSyncExternalStore } from "react";

import { type BreakpointOrBase, breakpointUpQuery, breakpoints } from "../foundations/breakpoints";
import { getMediaQueryList } from "./mediaQueryList";

const breakpointQueries = (): MediaQueryList[] =>
  breakpoints.flatMap((bp) => getMediaQueryList(breakpointUpQuery(bp)) ?? []);

const subscribe = (onChange: () => void) => {
  const lists = breakpointQueries();
  for (const mql of lists) mql.addEventListener("change", onChange);
  return () => {
    for (const mql of lists) mql.removeEventListener("change", onChange);
  };
};

const subscribeNever = () => () => {};

const currentBreakpointIndex = (): number =>
  breakpointQueries().reduce((index, mql, i) => (mql.matches ? i + 1 : index), 0);

const baseIndex = () => 0;

export function useResponsiveValue(value: unknown): unknown {
  const responsive = value != null && typeof value === "object";
  const index = useSyncExternalStore(
    responsive ? subscribe : subscribeNever,
    responsive ? currentBreakpointIndex : baseIndex,
    baseIndex,
  );
  if (!responsive) return value;

  const steps: BreakpointOrBase[] = ["base", ...breakpoints.slice(0, index)];
  let resolved: unknown;
  steps.forEach((step, i) => {
    const candidate = Array.isArray(value) ? value[i] : (value as Record<string, unknown>)[step];
    if (candidate != null) resolved = candidate;
  });
  return resolved;
}
