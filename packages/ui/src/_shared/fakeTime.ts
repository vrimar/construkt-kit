import { act } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";

type UserEventOptions = Parameters<typeof userEvent.setup>[0];

export function useFakeTime() {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    // Testing Library's waitFor/findBy advance fake timers only through a global `jest`.
    vi.stubGlobal("jest", { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
}

// zag wires overlay listeners up to two frames after opening, so actions are spaced like a quick human's.
const ACTION_GAP_MS = 50;

export const setupUser = (options?: UserEventOptions): UserEvent =>
  userEvent.setup({
    advanceTimers: (ms) => vi.advanceTimersByTimeAsync(ms),
    delay: ACTION_GAP_MS,
    ...options,
  });

export const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

export const settle = () => advance(ACTION_GAP_MS);
