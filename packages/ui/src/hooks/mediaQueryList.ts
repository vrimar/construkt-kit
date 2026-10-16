let cache: { matchMedia: typeof window.matchMedia; byQuery: Map<string, MediaQueryList> } | null =
  null;

export const getMediaQueryList = (query: string): MediaQueryList | null => {
  if (typeof window.matchMedia !== "function") return null;
  // A replaced matchMedia (a test mock, a polyfill) gets fresh lists.
  if (cache?.matchMedia !== window.matchMedia) {
    cache = { matchMedia: window.matchMedia, byQuery: new Map() };
  }
  let list = cache.byQuery.get(query);
  if (list == null) {
    list = window.matchMedia(query);
    cache.byQuery.set(query, list);
  }
  return list;
};
