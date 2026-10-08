import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { COLOR_MODE_STORAGE_KEY, ColorModeProvider, useColorMode } from ".";
import { createMatchMedia } from "../_shared/matchMedia";

function installLocalStorageMock() {
  let store: Record<string, string> = {};
  const mock: Storage = {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key) {
      return key in store ? store[key] : null;
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key) {
      delete store[key];
    },
    setItem(key, value) {
      store[key] = String(value);
    },
  };
  Object.defineProperty(window, "localStorage", {
    value: mock,
    configurable: true,
    writable: true,
  });
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ColorModeProvider>{children}</ColorModeProvider>
);

const root = document.documentElement;

beforeEach(() => {
  installLocalStorageMock();
  root.classList.remove("dark");
});

describe("useColorMode", () => {
  it("defaults to system and resolves to light when the OS prefers light", () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.mode).toBe("system");
    expect(result.current.resolvedMode).toBe("light");
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("resolves system to dark and applies the dark class", () => {
    window.matchMedia = createMatchMedia(true);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("toggles between light and dark and persists the choice", () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.toggle());

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe("dark");
  });

  it("reads the persisted mode on mount", () => {
    window.matchMedia = createMatchMedia(false);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("removes the dark class on unmount", () => {
    window.matchMedia = createMatchMedia(false);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");
    const { unmount } = renderHook(() => useColorMode(), { wrapper });

    unmount();

    expect(root.classList.contains("dark")).toBe(false);
  });
});
