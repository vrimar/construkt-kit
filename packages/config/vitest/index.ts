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
 * `Element#scrollIntoView`, `Element#setPointerCapture`, `Element#getAnimations`, the
 * `HTMLElement` popover methods and `HTMLDialogElement#showModal`/`show`/`close`, which jsdom
 * lacks. Leaves any the environment already has. Call it from a Vitest setup file that runs in
 * jsdom.
 */
export function installDomPolyfills(): void {
  globalThis.ResizeObserver ??= NoopResizeObserver;
  globalThis.IntersectionObserver ??= NoopIntersectionObserver;

  const element: Partial<Element> = Element.prototype;
  element.scrollTo ??= () => {};
  element.scrollIntoView ??= () => {};
  element.setPointerCapture ??= () => {};
  element.getAnimations ??= () => [];

  const htmlElement: Partial<HTMLElement> = HTMLElement.prototype;
  if (!htmlElement.showPopover) {
    // jsdom's default stylesheet hides every [popover], since it never matches :popover-open.
    const style = document.createElement("style");
    style.textContent = `[popover][${POPOVER_OPEN}] { display: block; }`;
    document.head.append(style);
    htmlElement.showPopover = function showPopover(this: HTMLElement) {
      this.setAttribute(POPOVER_OPEN, "");
    };
    htmlElement.hidePopover = function hidePopover(this: HTMLElement) {
      this.removeAttribute(POPOVER_OPEN);
    };
    htmlElement.togglePopover = function togglePopover(
      this: HTMLElement,
      options?: boolean | { force?: boolean },
    ) {
      const force = typeof options === "boolean" ? options : options?.force;
      const show = force ?? !this.hasAttribute(POPOVER_OPEN);
      this.toggleAttribute(POPOVER_OPEN, show);
      return show;
    };
  }

  const dialog: Partial<HTMLDialogElement> = HTMLDialogElement.prototype;
  if (!dialog.showModal) {
    const show = function show(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    dialog.show = show;
    dialog.showModal = show;
    dialog.close = function close(this: HTMLDialogElement, returnValue?: string) {
      if (!this.hasAttribute("open")) return;
      if (returnValue !== undefined) this.returnValue = returnValue;
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
}

const POPOVER_OPEN = "data-jsdom-popover-open";

/** Answers whether a media query matches. */
export type MediaMatcher = (query: string) => boolean;

const toMatcher = (matches: MediaMatcher | boolean): MediaMatcher =>
  typeof matches === "boolean" ? () => matches : matches;

/**
 * A `matchMedia` for jsdom, which has none. `initial` answers every query, or each one by the query string.
 * `setMatches(next)` changes the answer and calls every `change` listener added through it.
 */
export function createMatchMedia(initial: MediaMatcher | boolean): {
  matchMedia: (query: string) => MediaQueryList;
  setMatches(next: MediaMatcher | boolean): void;
} {
  let matcher = toMatcher(initial);
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
    setMatches(next) {
      matcher = toMatcher(next);
      for (const listener of listeners) listener();
    },
  };
}
