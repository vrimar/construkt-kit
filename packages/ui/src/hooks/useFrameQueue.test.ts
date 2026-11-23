import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useFrameQueue } from "./useFrameQueue";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
});

afterEach(() => {
  vi.useRealTimers();
});

it("runs only the latest callback requested under a key", () => {
  const { result } = renderHook(() => useFrameQueue());
  const first = vi.fn();
  const second = vi.fn();

  result.current.request("focus", first);
  result.current.request("focus", second);
  vi.advanceTimersToNextFrame();

  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledOnce();
});

it("drops pending frames on unmount", () => {
  const { result, unmount } = renderHook(() => useFrameQueue());
  const callback = vi.fn();

  result.current.request("paste", callback);
  unmount();
  vi.advanceTimersToNextFrame();

  expect(callback).not.toHaveBeenCalled();
});
