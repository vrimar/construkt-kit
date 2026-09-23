export const COLOR_MODE_STORAGE_KEY = "construkt-color-mode";

export interface ColorModeScriptOptions {
  storageKey?: string;
  /** Must match the `ColorModeProvider` `defaultMode` prop, or first paint can disagree with hydration. */
  defaultMode?: "light" | "dark" | "system";
}

// Serialized into the pre-paint script, so it must not reference module scope.
export function applyColorMode(stored: string | null, fallback: "light" | "dark" | "system") {
  const mode = stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Inline in `<head>` before hydration to set the theme class pre-paint and avoid a flash. */
export function createColorModeScript({
  storageKey = COLOR_MODE_STORAGE_KEY,
  defaultMode = "system",
}: ColorModeScriptOptions = {}): string {
  return `(function(){try{(${applyColorMode.toString()})(localStorage.getItem(${JSON.stringify(storageKey)}),${JSON.stringify(defaultMode)});}catch(e){}})();`;
}

export const colorModeScript = createColorModeScript();
