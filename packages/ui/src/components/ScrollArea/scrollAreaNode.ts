import type { PointerEvent as ReactPointerEvent } from "react";

import { Store } from "../../primitives/store";

export type ScrollbarOrientation = "vertical" | "horizontal";

export interface ScrollEdges {
  overflowX: boolean;
  overflowY: boolean;
  atTop: boolean;
  atBottom: boolean;
  atLeft: boolean;
  atRight: boolean;
}

export interface ScrollAreaState {
  edges: ScrollEdges;
  hovering: boolean;
  scrollingX: boolean;
  scrollingY: boolean;
  dragging: ScrollbarOrientation | null;
}

const MIN_THUMB_SIZE = 20;
const SCROLL_TIMEOUT = 1000;
const SCROLL_END_TIMEOUT = 100;
const EDGE_THRESHOLD = 1;

const INITIAL_STATE: ScrollAreaState = {
  edges: {
    overflowX: true,
    overflowY: true,
    atTop: true,
    atBottom: false,
    atLeft: true,
    atRight: false,
  },
  hovering: false,
  scrollingX: false,
  scrollingY: false,
  dragging: null,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getOffset(element: HTMLElement | null, prop: "margin" | "padding", axis: "x" | "y") {
  if (!element) return 0;
  const styles = getComputedStyle(element);
  const key = `${prop}${axis === "x" ? "Inline" : "Block"}` as const;
  const start = Number.parseFloat(styles[`${key}Start`]);
  // Safari misreports `marginInlineEnd` in RTL, so the margins are taken as symmetrical.
  if (axis === "x" && prop === "margin") return start * 2;
  return start + Number.parseFloat(styles[`${key}End`]);
}

function getEdges(viewport: HTMLElement, rtl: boolean): ScrollEdges {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = viewport;
  const maxScrollTop = scrollHeight - clientHeight;
  const maxScrollLeft = scrollWidth - clientWidth;
  const scrollsY = maxScrollTop > EDGE_THRESHOLD;
  const scrollsX = maxScrollLeft > EDGE_THRESHOLD;
  const fromLeft = rtl ? maxScrollLeft + scrollLeft : scrollLeft;
  return {
    overflowX: clientWidth < scrollWidth,
    overflowY: clientHeight < scrollHeight,
    atTop: scrollsY && scrollTop <= EDGE_THRESHOLD,
    atBottom: scrollsY && scrollTop >= maxScrollTop - EDGE_THRESHOLD,
    atLeft: scrollsX && fromLeft <= EDGE_THRESHOLD,
    atRight: scrollsX && fromLeft >= maxScrollLeft - EDGE_THRESHOLD,
  };
}

const sameEdges = (a: ScrollEdges, b: ScrollEdges) =>
  a.overflowX === b.overflowX &&
  a.overflowY === b.overflowY &&
  a.atTop === b.atTop &&
  a.atBottom === b.atBottom &&
  a.atLeft === b.atLeft &&
  a.atRight === b.atRight;

interface Drag {
  pointerId: number;
  orientation: ScrollbarOrientation;
  startX: number;
  startY: number;
  startScrollTop: number;
  startScrollLeft: number;
}

type Parts<T> = Record<ScrollbarOrientation, T>;

export class ScrollAreaNode {
  readonly store = new Store<ScrollAreaState>(INITIAL_STATE);

  private rtl = false;
  private root: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  private corner: HTMLElement | null = null;
  private readonly scrollbars: Parts<HTMLElement | null> = { vertical: null, horizontal: null };
  private readonly thumbs: Parts<HTMLElement | null> = { vertical: null, horizontal: null };
  private scrollPosition = { x: 0, y: 0 };
  private programmaticScroll = true;
  private touchModality = false;
  private drag: Drag | null = null;
  private measureQueued = false;
  private readonly timers: Record<"x" | "y" | "end", ReturnType<typeof setTimeout> | undefined> = {
    x: undefined,
    y: undefined,
    end: undefined,
  };

  setDirection(dir: "ltr" | "rtl"): void {
    this.rtl = dir === "rtl";
  }

  setRoot = (element: HTMLElement | null): void => {
    this.root = element;
  };

  setViewport = (element: HTMLElement | null): (() => void) => {
    this.viewport = element;
    const stopObserving = element ? this.observe(element) : undefined;
    this.queueMeasure();
    return () => {
      stopObserving?.();
      if (this.viewport === element) this.viewport = null;
    };
  };

  setContent = (element: HTMLElement | null): (() => void) | undefined =>
    element ? this.observe(element) : undefined;

  setCorner = (element: HTMLElement | null): (() => void) => {
    this.corner = element;
    this.queueMeasure();
    return () => {
      if (this.corner === element) this.corner = null;
    };
  };

  readonly scrollbarRefs: Parts<(element: HTMLElement | null) => () => void> = {
    vertical: (element) => this.setScrollbar("vertical", element),
    horizontal: (element) => this.setScrollbar("horizontal", element),
  };

  readonly thumbRefs: Parts<(element: HTMLElement | null) => () => void> = {
    vertical: (element) => this.setThumb("vertical", element),
    horizontal: (element) => this.setThumb("horizontal", element),
  };

  private setScrollbar(orientation: ScrollbarOrientation, element: HTMLElement | null) {
    this.scrollbars[orientation] = element;
    const onWheel = (event: WheelEvent) => this.onScrollbarWheel(event, orientation);
    element?.addEventListener("wheel", onWheel, { passive: false });
    this.queueMeasure();
    return () => {
      element?.removeEventListener("wheel", onWheel);
      if (this.scrollbars[orientation] === element) this.scrollbars[orientation] = null;
    };
  }

  private setThumb(orientation: ScrollbarOrientation, element: HTMLElement | null) {
    this.thumbs[orientation] = element;
    this.queueMeasure();
    return () => {
      if (this.thumbs[orientation] === element) this.thumbs[orientation] = null;
    };
  }

  private observe(element: HTMLElement) {
    const observer = new ResizeObserver(() => this.measure());
    observer.observe(element);
    return () => observer.disconnect();
  }

  private queueMeasure() {
    if (this.measureQueued) return;
    this.measureQueued = true;
    queueMicrotask(() => {
      this.measureQueued = false;
      this.measure();
    });
  }

  measure = (): void => {
    const viewport = this.viewport;
    if (!viewport) return;
    const { scrollHeight, scrollWidth, clientHeight, clientWidth, scrollTop, scrollLeft } =
      viewport;
    if (scrollHeight === 0 || scrollWidth === 0) return;

    const edges = getEdges(viewport, this.rtl);
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    this.placeThumb("vertical", {
      track: edges.overflowY ? clientHeight : 0,
      ratio: clientHeight / scrollHeight,
      progress: maxScrollTop ? scrollTop / maxScrollTop : 0,
    });
    this.placeThumb("horizontal", {
      track: edges.overflowX ? clientWidth : 0,
      ratio: clientWidth / scrollWidth,
      progress: maxScrollLeft ? scrollLeft / maxScrollLeft : 0,
    });

    if (this.corner) {
      const both = edges.overflowX && edges.overflowY;
      const width = both ? this.scrollbars.vertical?.offsetWidth || 0 : 0;
      const height = both ? this.scrollbars.horizontal?.offsetHeight || 0 : 0;
      this.corner.style.setProperty("--scroll-area-corner-width", `${width}px`);
      this.corner.style.setProperty("--scroll-area-corner-height", `${height}px`);
      this.scrollbars.vertical?.style.setProperty("--scroll-area-corner-height", `${height}px`);
      this.scrollbars.horizontal?.style.setProperty("--scroll-area-corner-width", `${width}px`);
    }

    const fromStartX = edges.overflowX
      ? clamp(this.rtl ? -scrollLeft : scrollLeft, 0, maxScrollLeft)
      : 0;
    const fromStartY = edges.overflowY ? clamp(scrollTop, 0, maxScrollTop) : 0;
    const overflow = {
      "--scroll-area-overflow-x-start": fromStartX,
      "--scroll-area-overflow-x-end": edges.overflowX ? maxScrollLeft - fromStartX : 0,
      "--scroll-area-overflow-y-start": fromStartY,
      "--scroll-area-overflow-y-end": edges.overflowY ? maxScrollTop - fromStartY : 0,
    };
    for (const [name, px] of Object.entries(overflow)) {
      viewport.style.setProperty(name, `${px}px`);
    }

    const state = this.store.state;
    if (!sameEdges(state.edges, edges)) this.store.setState({ ...state, edges });
  };

  private placeThumb(
    orientation: ScrollbarOrientation,
    axis: { track: number; ratio: number; progress: number },
  ) {
    const scrollbar = this.scrollbars[orientation];
    const thumb = this.thumbs[orientation];
    if (!scrollbar || !thumb) return;
    const vertical = orientation === "vertical";
    const scrollbarOffset = getOffset(scrollbar, "padding", vertical ? "y" : "x");
    const thumbOffset = getOffset(thumb, "margin", vertical ? "y" : "x");
    const trackLength = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const size = Math.max(
      MIN_THUMB_SIZE,
      Math.min(trackLength, axis.track - scrollbarOffset - thumbOffset) * axis.ratio,
    );
    const maxOffset = trackLength - size - scrollbarOffset - thumbOffset;
    // Clamped because Safari's rubber band scrolls past both ends.
    const offset =
      !vertical && this.rtl
        ? clamp(axis.progress * maxOffset, -maxOffset, 0)
        : clamp(axis.progress * maxOffset, 0, maxOffset);
    thumb.style.setProperty(
      vertical ? "--scroll-area-thumb-height" : "--scroll-area-thumb-width",
      `${size}px`,
    );
    thumb.style.setProperty("--scroll-area-thumb-offset", `${offset}px`);
  }

  onViewportScroll = (): void => {
    const viewport = this.viewport;
    if (!viewport) return;
    this.measure();
    const position = { x: viewport.scrollLeft, y: viewport.scrollTop };
    const previous = this.scrollPosition;
    this.scrollPosition = position;
    // WebKit fires no events for a touch that catches momentum, so touch scrolls count as the user's.
    if (this.touchModality || !this.programmaticScroll) {
      if (position.y !== previous.y) this.startScrolling("y");
      if (position.x !== previous.x) this.startScrolling("x");
    }
    clearTimeout(this.timers.end);
    this.timers.end = setTimeout(() => {
      this.programmaticScroll = true;
    }, SCROLL_END_TIMEOUT);
  };

  onUserInteraction = (): void => {
    this.programmaticScroll = false;
  };

  private startScrolling(axis: "x" | "y") {
    const key = axis === "x" ? "scrollingX" : "scrollingY";
    this.store.set(key, true);
    clearTimeout(this.timers[axis]);
    this.timers[axis] = setTimeout(() => this.store.set(key, false), SCROLL_TIMEOUT);
  }

  onRootPointer = (event: ReactPointerEvent<HTMLElement>): void => {
    this.touchModality = event.pointerType === "touch";
    if (event.type === "pointerdown" || this.touchModality) return;
    this.store.set("hovering", this.root?.contains(event.target as Node) ?? false);
  };

  onRootPointerLeave = (): void => {
    this.store.set("hovering", false);
  };

  checkHovering(): void {
    if (this.viewport?.matches(":hover")) this.store.set("hovering", true);
  }

  onTrackPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    orientation: ScrollbarOrientation,
  ): void => {
    if (event.button !== 0) return;
    const thumb = this.thumbs[orientation];
    const scrollbar = this.scrollbars[orientation];
    const viewport = this.viewport;
    if (!thumb || !scrollbar || !viewport || thumb.contains(event.target as Node)) return;

    const vertical = orientation === "vertical";
    const thumbOffset = getOffset(thumb, "margin", vertical ? "y" : "x");
    const scrollbarOffset = getOffset(scrollbar, "padding", vertical ? "y" : "x");
    const thumbSize = vertical ? thumb.offsetHeight : thumb.offsetWidth;
    const trackRect = scrollbar.getBoundingClientRect();
    const pressed = vertical ? event.clientY - trackRect.top : event.clientX - trackRect.left;
    const position = pressed - thumbSize / 2 - scrollbarOffset + thumbOffset / 2;
    const trackLength = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const maxThumbOffset = trackLength - thumbSize - scrollbarOffset - thumbOffset;
    if (maxThumbOffset <= 0) return;

    const ratio = position / maxThumbOffset;
    if (vertical) {
      viewport.scrollTop = ratio * (viewport.scrollHeight - viewport.clientHeight);
    } else {
      const range = viewport.scrollWidth - viewport.clientWidth;
      viewport.scrollLeft = this.rtl ? -(1 - ratio) * range : ratio * range;
    }
    this.startDrag(event, orientation);
  };

  onThumbPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    orientation: ScrollbarOrientation,
  ): void => {
    if (event.button !== 0) return;
    this.startDrag(event, orientation);
  };

  private startDrag(event: ReactPointerEvent<HTMLElement>, orientation: ScrollbarOrientation) {
    const active = this.drag;
    const activeThumb = active ? this.thumbs[active.orientation] : null;
    if (active && activeThumb?.hasPointerCapture(active.pointerId)) return;
    const viewport = this.viewport;
    if (!viewport) return;
    this.drag = {
      pointerId: event.pointerId,
      orientation,
      startX: event.clientX,
      startY: event.clientY,
      startScrollTop: viewport.scrollTop,
      startScrollLeft: viewport.scrollLeft,
    };
    this.thumbs[orientation]?.setPointerCapture(event.pointerId);
    this.store.set("dragging", orientation);
  }

  onThumbPointerMove = (event: ReactPointerEvent<HTMLElement>): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    // A capture the browser dropped can lose the release; a move without the button is that release.
    if (event.buttons % 2 === 0) {
      this.onPointerUp(event);
      return;
    }
    const viewport = this.viewport;
    const vertical = drag.orientation === "vertical";
    const thumb = this.thumbs[drag.orientation];
    const scrollbar = this.scrollbars[drag.orientation];
    if (!viewport || !thumb || !scrollbar) return;

    const scrollbarOffset = getOffset(scrollbar, "padding", vertical ? "y" : "x");
    const thumbOffset = getOffset(thumb, "margin", vertical ? "y" : "x");
    const thumbSize = vertical ? thumb.offsetHeight : thumb.offsetWidth;
    const trackLength = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const maxThumbOffset = trackLength - thumbSize - scrollbarOffset - thumbOffset;
    const delta = vertical ? event.clientY - drag.startY : event.clientX - drag.startX;
    const ratio = maxThumbOffset <= 0 ? 0 : delta / maxThumbOffset;

    if (vertical) {
      viewport.scrollTop =
        drag.startScrollTop + ratio * (viewport.scrollHeight - viewport.clientHeight);
    } else {
      viewport.scrollLeft =
        drag.startScrollLeft + ratio * (viewport.scrollWidth - viewport.clientWidth);
    }
    event.preventDefault();
    this.startScrolling(vertical ? "y" : "x");
  };

  onPointerUp = (event: ReactPointerEvent<HTMLElement>): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = null;
    const vertical = drag.orientation === "vertical";
    clearTimeout(this.timers[vertical ? "y" : "x"]);
    this.store.setState({
      ...this.store.state,
      dragging: null,
      ...(vertical ? { scrollingY: false } : { scrollingX: false }),
    });
    const thumb = this.thumbs[drag.orientation];
    if (thumb?.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);
  };

  private onScrollbarWheel(event: WheelEvent, orientation: ScrollbarOrientation) {
    const viewport = this.viewport;
    if (!viewport || event.ctrlKey) return;
    const horizontal = orientation === "horizontal";
    const delta = horizontal ? event.deltaX : event.deltaY;
    if (delta === 0) return;
    const maxScroll = horizontal
      ? viewport.scrollWidth - viewport.clientWidth
      : viewport.scrollHeight - viewport.clientHeight;
    const min = horizontal && this.rtl ? -maxScroll : 0;
    const max = horizontal && this.rtl ? 0 : maxScroll;
    const current = horizontal ? viewport.scrollLeft : viewport.scrollTop;
    // At an edge the wheel chains to the page, as it would over a native scrollbar.
    if ((current <= min && delta < 0) || (current >= max && delta > 0)) return;
    event.preventDefault();
    this.onUserInteraction();
    const next = clamp(current + delta, min, max);
    if (horizontal) viewport.scrollLeft = next;
    else viewport.scrollTop = next;
  }

  clearTimers(): void {
    for (const timer of Object.values(this.timers)) clearTimeout(timer);
  }
}
