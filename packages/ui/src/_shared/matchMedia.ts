import { type MediaMatcher, createMatchMedia } from "@construkt-kit/config/vitest";
import { onTestFinished, vi } from "vitest";

import {
  breakpointDownQuery,
  breakpointPx,
  breakpoints,
  breakpointUpQuery,
} from "../foundations/breakpoints";

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
