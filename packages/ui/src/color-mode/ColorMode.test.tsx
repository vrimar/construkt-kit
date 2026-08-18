import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { COLOR_MODE_STORAGE_KEY, ColorModeProvider, useColorMode } from ".";

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

function mockMatchMedia(matches: boolean) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ColorModeProvider>{children}</ColorModeProvider>
);

const root = document.documentElement;

beforeEach(() => {
  installLocalStorageMock();
  root.classList.remove("dark");
  root.style.colorScheme = "";
});

afterEach(() => {
  cleanup();
});

describe("useColorMode", () => {
  it("defaults to system and resolves to light when the OS prefers light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.mode).toBe("system");
    expect(result.current.resolvedMode).toBe("light");
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
  });

  it("resolves system to dark and applies the dark class + color-scheme", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
  });

  it("toggles between light and dark and persists the choice", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.toggle());

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe("dark");
  });

  it("reads the persisted mode on mount", () => {
    mockMatchMedia(false);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedMode).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
  });
});
