export type StoryTheme = "light" | "dark";

/** What the gallery publishes on `window.__gallery` before it sets `<html data-gallery>`. */
export interface GalleryState {
  id?: string;
  /** The stack of the error the story threw while rendering. */
  error?: string;
  /** The axe rules the story disables. */
  a11yRules?: string[];
  /** Calls recorded on a story arg created with `fn()`, with arguments serialised to JSON. */
  calls(arg: string): unknown[][];
}

declare global {
  interface Window {
    __gallery?: GalleryState;
  }
}

/** The gallery page that renders one story alone. */
export function storyUrl(id: string, theme: StoryTheme): string {
  const params = new URLSearchParams({ id });
  if (theme === "dark") params.set("theme", "dark");
  return `/?${params}`;
}

export function parseStoryUrl(search: string): { id: string | null; theme: StoryTheme } {
  const params = new URLSearchParams(search);
  return { id: params.get("id"), theme: params.get("theme") === "dark" ? "dark" : "light" };
}
