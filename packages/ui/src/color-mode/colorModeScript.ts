export const COLOR_MODE_STORAGE_KEY = "construkt-color-mode";

export type ColorMode = "light" | "dark" | "system";

export const DEFAULT_COLOR_MODE: ColorMode = "system";

export interface ColorModeScriptOptions {
  storageKey?: string;
  /** Must match between `createColorModeScript` and `ColorModeProvider`, or first paint can disagree with hydration. */
  defaultMode?: ColorMode;
}

// Serialized into the pre-paint script, so it must not reference module scope.
export function applyColorMode(stored: string | null, fallback: ColorMode) {
  const mode = stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Inline in `<head>` before hydration to set the theme class pre-paint and avoid a flash. */
export function createColorModeScript({
  storageKey = COLOR_MODE_STORAGE_KEY,
  defaultMode = DEFAULT_COLOR_MODE,
}: ColorModeScriptOptions = {}): string {
  return `(function(){try{(${applyColorMode.toString()})(localStorage.getItem(${JSON.stringify(storageKey)}),${JSON.stringify(defaultMode)});}catch(e){}})();`;
}

export const colorModeScript = createColorModeScript();
