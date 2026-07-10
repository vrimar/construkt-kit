import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useMediaQuery } from "../hooks/useMediaQuery";
import { COLOR_MODE_STORAGE_KEY } from "./colorModeScript";

export type ColorMode = "light" | "dark" | "system";
export type ResolvedColorMode = "light" | "dark";

export interface ColorModeContextValue {
  /** The chosen mode, including `"system"`. */
  mode: ColorMode;
  /** The concrete mode currently applied (`"system"` resolved via OS preference). */
  resolvedMode: ResolvedColorMode;
  setMode: (mode: ColorMode) => void;
  /** Flip between light and dark based on what's currently applied. */
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export interface ColorModeProviderProps {
  children: React.ReactNode;
  defaultMode?: ColorMode;
  storageKey?: string;
}

const isColorMode = (value: string | null): value is ColorMode =>
  value === "light" || value === "dark" || value === "system";

// Guarded storage access — localStorage can be absent (SSR) or throw (private mode, disabled).
function safeGetItem(storageKey: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function safeSetItem(storageKey: string, value: string): void {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, value);
  } catch {
    // Storage unavailable — the mode still applies for the session.
  }
}

function readStoredMode(storageKey: string, fallback: ColorMode): ColorMode {
  const stored = safeGetItem(storageKey);
  return isColorMode(stored) ? stored : fallback;
}

export const ColorModeProvider = ({
  children,
  defaultMode = "system",
  storageKey = COLOR_MODE_STORAGE_KEY,
}: ColorModeProviderProps) => {
  const [mode, setModeState] = useState<ColorMode>(() => readStoredMode(storageKey, defaultMode));
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const resolvedMode: ResolvedColorMode =
    mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  useEffect(() => {
    // Read matchMedia fresh (not the hydration snapshot) so we never strip a `dark` class the FOUC script set.
    const dark =
      mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : resolvedMode === "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    return () => {
      root.classList.remove("dark");
      root.style.colorScheme = "";
    };
  }, [mode, resolvedMode]);

  const setMode = useCallback(
    (next: ColorMode) => {
      setModeState(next);
      safeSetItem(storageKey, next);
    },
    [storageKey],
  );

  const toggle = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, resolvedMode, setMode, toggle }),
    [mode, resolvedMode, setMode, toggle],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export const useColorMode = (): ColorModeContextValue => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a <ColorModeProvider>");
  }
  return context;
};
