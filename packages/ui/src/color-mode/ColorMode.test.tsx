import { runInThisContext } from "node:vm";

import { act, renderHook } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { COLOR_MODE_STORAGE_KEY, ColorModeProvider, createColorModeScript, useColorMode } from ".";
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

  it("hydrates server markup when a mode is stored", async () => {
    window.matchMedia = createMatchMedia(false);
    const ThemeToggle = () => {
      const { resolvedMode } = useColorMode();
      return <button type="button">{`Switch from ${resolvedMode}`}</button>;
    };
    const app = (
      <ColorModeProvider defaultMode="light">
        <ThemeToggle />
      </ColorModeProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(app);
    document.body.append(container);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");
    root.classList.add("dark");
    const onRecoverableError = vi.fn();

    const hydrated = await act(async () => hydrateRoot(container, app, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe("Switch from dark");
    expect(root.classList.contains("dark")).toBe(true);
    act(() => hydrated.unmount());
    container.remove();
  });
});

describe("createColorModeScript", () => {
  it("applies the default mode when storage throws", () => {
    window.matchMedia = createMatchMedia(false);
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
      configurable: true,
    });

    runInThisContext(createColorModeScript({ defaultMode: "dark" }));

    expect(root.classList.contains("dark")).toBe(true);
  });

  it("applies the stored mode over the default", () => {
    window.matchMedia = createMatchMedia(false);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");

    runInThisContext(createColorModeScript({ defaultMode: "light" }));

    expect(root.classList.contains("dark")).toBe(true);
  });
});
