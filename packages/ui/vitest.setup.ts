import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { createMatchMedia } from "./src/_shared/matchMedia";

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

globalThis.matchMedia ??= createMatchMedia(false);

afterEach(cleanup);
