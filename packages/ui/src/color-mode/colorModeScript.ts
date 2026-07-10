export const COLOR_MODE_STORAGE_KEY = "construkt-color-mode";

export interface ColorModeScriptOptions {
  storageKey?: string;
  /** Must match the `ColorModeProvider` `defaultMode` prop, or first paint can disagree with hydration. */
  defaultMode?: "light" | "dark" | "system";
}

/** Inline in `<head>` before hydration to set the theme class pre-paint and avoid a flash. */
export function createColorModeScript({
  storageKey = COLOR_MODE_STORAGE_KEY,
  defaultMode = "system",
}: ColorModeScriptOptions = {}): string {
  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
}

export const colorModeScript = createColorModeScript();
