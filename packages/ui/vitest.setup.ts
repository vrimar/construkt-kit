import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

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

if (!("scrollTo" in Element.prototype)) {
  Element.prototype.scrollTo = () => {};
}

globalThis.matchMedia ??= (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
});

afterEach(cleanup);
