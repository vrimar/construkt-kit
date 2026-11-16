class NoopResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

class NoopIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds: readonly number[] = [];

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

/**
 * Installs no-op `ResizeObserver`, `IntersectionObserver`, `Element#scrollTo`,
 * `Element#scrollIntoView` and `Element#setPointerCapture`, which jsdom lacks. Leaves any the
 * environment already has. Call it from a Vitest setup file that runs in jsdom.
 */
export function installDomPolyfills(): void {
  globalThis.ResizeObserver ??= NoopResizeObserver;
  globalThis.IntersectionObserver ??= NoopIntersectionObserver;

  const element: Partial<Element> = Element.prototype;
  element.scrollTo ??= () => {};
  element.scrollIntoView ??= () => {};
  element.setPointerCapture ??= () => {};
}
