export const createMatchMedia =
  (matches: boolean) =>
  (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });

export function createMatchMediaController(initial: (query: string) => boolean) {
  let matcher = initial;
  const listeners = new Set<() => void>();

  const matchMedia = (query: string) =>
    ({
      get matches() {
        return matcher(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  return {
    matchMedia,
    setMatches(next: (query: string) => boolean) {
      matcher = next;
      for (const listener of listeners) listener();
    },
  };
}

export const isBelowBreakpointQuery = (query: string) => query.includes("width <");
