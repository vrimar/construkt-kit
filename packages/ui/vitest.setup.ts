class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

class IntersectionObserver {
  root = null;
  rootMargin = "0px";
  thresholds = [];

  disconnect() {}

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserver;
globalThis.IntersectionObserver = IntersectionObserver;

Element.prototype.scrollTo ??= () => {};

globalThis.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
