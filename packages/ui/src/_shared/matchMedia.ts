import { onTestFinished, vi } from "vitest";

import {
  breakpointDownQuery,
  breakpointPx,
  breakpoints,
  breakpointUpQuery,
} from "../foundations/breakpoints";

type MediaMatcher = (query: string) => boolean;

const toMatcher = (matches: MediaMatcher | boolean): MediaMatcher =>
  typeof matches === "boolean" ? () => matches : matches;

export function createMatchMedia(initial: MediaMatcher | boolean) {
  let matcher = toMatcher(initial);
  const listeners = new Set<() => void>();

  const matchMedia = (query: string) =>
    ({
      get matches() {
        return matcher(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  return {
    matchMedia,
    setMatches(next: MediaMatcher | boolean) {
      matcher = toMatcher(next);
      for (const listener of listeners) listener();
    },
  };
}

export function mockMatchMedia(matches: MediaMatcher | boolean) {
  const media = createMatchMedia(matches);
  const spy = vi.spyOn(window, "matchMedia").mockImplementation(media.matchMedia);
  onTestFinished(() => {
    spy.mockRestore();
  });
  return media;
}

export const viewportWidth =
  (px: number): MediaMatcher =>
  (query) =>
    breakpoints.some(
      (bp) =>
        (query === breakpointUpQuery(bp) && px >= breakpointPx(bp)) ||
        (query === breakpointDownQuery(bp) && px < breakpointPx(bp)),
    );
