// Modified from React Aria's overlays/usePreventScroll.ts (Apache-2.0, Copyright 2020 Adobe); see THIRD_PARTY_NOTICES.md.
import { useLayoutEffect } from "react";

import { holdStyle } from "../../foundations/holdStyle";
import { isIOS, isWebKit } from "../../foundations/platform";

type Restore = () => void;

let lockCount = 0;
let restoreLock: Restore | null = null;

function addEvent<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  options: AddEventListenerOptions,
): Restore {
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener, options);
}

const chain =
  (...restores: (Restore | false)[]): Restore =>
  () => {
    for (const restore of restores) if (restore) restore();
  };

function isScrollable(node: Element | null, checkForOverflow: boolean): boolean {
  if (!node) return false;
  const style = window.getComputedStyle(node);
  const root = document.scrollingElement ?? document.documentElement;
  let scrollable = /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
  if (node === root && style.overflow !== "hidden") scrollable = true;
  if (scrollable && checkForOverflow) {
    scrollable = node.scrollHeight !== node.clientHeight || node.scrollWidth !== node.clientWidth;
  }
  return scrollable;
}

function getScrollParent(node: Element, checkForOverflow: boolean): Element {
  let scrollable: Element | null = node;
  if (isScrollable(scrollable, checkForOverflow)) scrollable = scrollable.parentElement;
  while (scrollable && !isScrollable(scrollable, checkForOverflow)) {
    scrollable = scrollable.parentElement;
  }
  return scrollable ?? document.scrollingElement ?? document.documentElement;
}

function getNonce(): string | undefined {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="csp-nonce"], meta[property="csp-nonce"]',
  );
  const { __webpack_nonce__: webpackNonce } = window as Window & { __webpack_nonce__?: string };
  return meta?.nonce || meta?.content || webpackNonce || undefined;
}

function preventScrollStandard(): Restore {
  const html = document.documentElement;
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  return chain(
    scrollbarWidth > 0 &&
      ("scrollbarGutter" in html.style
        ? holdStyle(html, "scrollbar-gutter", "stable")
        : holdStyle(html, "padding-right", `${scrollbarWidth}px`)),
    holdStyle(html, "overflow", "hidden"),
  );
}

// Mobile Safari scrolls the page through `overflow: hidden`; only cancelling the touch moves stops it.
function preventScrollMobileWebKit(): Restore {
  const restoreOverflow = holdStyle(document.documentElement, "overflow", "hidden");

  let scrollable: Element | undefined;
  let allowTouchMove = false;
  const onTouchStart = (event: TouchEvent) => {
    const [first] = event.composedPath();
    if (!(first instanceof Element)) return;
    const target = first;
    scrollable = isScrollable(target, true) ? target : getScrollParent(target, true);
    allowTouchMove = false;

    const selection = target.ownerDocument.defaultView?.getSelection();
    if (selection && !selection.isCollapsed && selection.containsNode(target, true)) {
      allowTouchMove = true;
    }
    if (
      event
        .composedPath()
        .some((element) => element instanceof HTMLInputElement && element.type === "range")
    ) {
      allowTouchMove = true;
    }
    if (
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
      (target.selectionStart ?? 0) < (target.selectionEnd ?? 0) &&
      target.ownerDocument.activeElement === target
    ) {
      allowTouchMove = true;
    }
  };

  // iOS 26 applies overscroll-behavior only when it is set before touchstart.
  const style = document.createElement("style");
  const nonce = getNonce();
  if (nonce) style.nonce = nonce;
  style.textContent = "@layer { * { overscroll-behavior: contain; } }";
  document.head.prepend(style);

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 2 || allowTouchMove) return;
    if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
      event.preventDefault();
      return;
    }
    // overscroll-behavior doesn't stop chaining from an element that doesn't overflow (WebKit 243452).
    if (
      scrollable.scrollHeight === scrollable.clientHeight &&
      scrollable.scrollWidth === scrollable.clientWidth
    ) {
      event.preventDefault();
    }
  };

  const removeEvents = chain(
    addEvent(document, "touchstart", onTouchStart, { passive: false, capture: true }),
    addEvent(document, "touchmove", onTouchMove, { passive: false, capture: true }),
  );

  return () => {
    restoreOverflow();
    removeEvents();
    style.remove();
  };
}

/**
 * Keeps the page from scrolling while `enabled`, without shifting it where the scrollbar was.
 * Nested locks share one: the page scrolls again once every lock is released.
 */
export function useScrollLock(enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return;
    lockCount += 1;
    if (lockCount === 1) {
      restoreLock = isIOS() && isWebKit() ? preventScrollMobileWebKit() : preventScrollStandard();
    }
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        restoreLock?.();
        restoreLock = null;
      }
    };
  }, [enabled]);
}
