import { createContext } from "react";

export interface DocsShellContextValue {
  /** The current route, normalized. */
  currentRoute: string;
  /** The `<main>` holding the page, which takes focus after following a link. */
  content: () => HTMLElement | null;
}

export const DocsShellContext = createContext<DocsShellContextValue | null>(null);
