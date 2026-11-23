import { clampValue, sameItems } from "@construkt-kit/utils";
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type TouchEvent,
  type WheelEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { isComposingEvent, ownsArrowKeys } from "../../foundations/dom";
import { swallowNextClick, trackPointerMove } from "../../foundations/trackPointerMove";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import {
  CompositeList,
  type ListTarget,
  getKeyTarget,
  getTargetIndex,
} from "../../primitives/composite";
import { isFocusable } from "../../primitives/focus";
import { useLocale } from "../../primitives/locale";
import { getPageSnapPoints, getScrollSnapPositions, resolveSlidesPerMove } from "./scrollSnap";

export type CarouselOrientation = "horizontal" | "vertical";

export type CarouselValueChangeReason =
  | "prev-press"
  | "next-press"
  | "indicator-press"
  | "keyboard"
  | "autoplay"
  | "scroll"
  | "layout-change";

/** Why `onValueChange` was called, and a way to stay on the current page. */
export type CarouselValueChangeDetails = ChangeDetails<CarouselValueChangeReason>;

export interface CarouselTranslations {
  /** @default "Next slide" */
  nextTrigger?: string | undefined;
  /** @default "Previous slide" */
  prevTrigger?: string | undefined;
  /** An indicator's `aria-label`. @default "Go to slide N" */
  indicator?: ((index: number) => string) | undefined;
  /** A slide's `aria-label`. @default "N of COUNT" */
  item?: ((index: number, count: number) => string) | undefined;
  /** @default "Start slide rotation" */
  autoplayStart?: string | undefined;
  /** @default "Stop slide rotation" */
  autoplayStop?: string | undefined;
}

const DEFAULT_TRANSLATIONS: Required<CarouselTranslations> = {
  nextTrigger: "Next slide",
  prevTrigger: "Previous slide",
  indicator: (index) => `Go to slide ${index + 1}`,
  item: (index, count) => `${index + 1} of ${count}`,
  autoplayStart: "Start slide rotation",
  autoplayStop: "Stop slide rotation",
};

export interface CarouselRootOptions {
  /** How many slides the carousel holds. */
  slideCount: number;
  /** The current page, from 0. */
  value?: number | undefined;
  /** @default 0 */
  defaultValue?: number | undefined;
  /** Called with the page to move to; `details.cancel()` stays on the current one. */
  onValueChange?: ((page: number, details: CarouselValueChangeDetails) => void) | undefined;
  /** @default "horizontal" */
  orientation?: CarouselOrientation | undefined;
  /** How many slides show at a time. @default 1 */
  slidesPerPage?: number | undefined;
  /** How many slides a page moves by; `"auto"` moves by `slidesPerPage`. @default "auto" */
  slidesPerMove?: number | "auto" | undefined;
  /** A CSS length between slides. @default the `spacing.4` token */
  spacing?: string | undefined;
  /** A CSS length the slides are inset by at each end, so the neighbouring slides peek in. */
  peek?: string | undefined;
  /** Whether moving past the last page goes to the first, and back. @default `autoplay` is set */
  loop?: boolean | undefined;
  /**
   * Whether the slides advance on their own, every `delay` ms (4000 by default). They pause while
   * the pointer is over the carousel, focus is inside it or the page is hidden, and stop when the
   * user moves to a page, swipes or drags.
   * @default false
   */
  autoplay?: boolean | { delay: number } | undefined;
  /** Whether a mouse can drag the slides. @default false */
  allowMouseDrag?: boolean | undefined;
  /** Whether each slide takes its own width instead of `slidesPerPage` sharing the row. @default false */
  autoSize?: boolean | undefined;
  /** How much of a slide must show for it to count as in view. @default 0.6 */
  inViewThreshold?: number | number[] | undefined;
  translations?: CarouselTranslations | undefined;
}

/** Every `CarouselRootOptions` key, to split them off the root's props. */
export const CAROUSEL_ROOT_KEYS = {
  slideCount: true,
  value: true,
  defaultValue: true,
  onValueChange: true,
  orientation: true,
  slidesPerPage: true,
  slidesPerMove: true,
  spacing: true,
  peek: true,
  loop: true,
  autoplay: true,
  allowMouseDrag: true,
  autoSize: true,
  inViewThreshold: true,
  translations: true,
} as const satisfies Record<keyof CarouselRootOptions, true>;

type Mode = "idle" | "userScroll" | "dragging" | "settling";

export const AUTOPLAY_DELAY = 4000;
const DRIFT_THRESHOLD = 1;
const USER_SCROLL_END_DELAY = 150;
const SETTLE_END_DELAY = 200;
const WHEEL_THROTTLE = 150;
const SWIPE_DISTANCE = 10;

const pressesFocusable = (target: Element, container: Element) => {
  for (let node: Element | null = target; node && node !== container; node = node.parentElement) {
    if (isFocusable(node)) return true;
  }
  return false;
};

const closestIndex = (points: readonly number[], position: number) =>
  points.reduce(
    (closest, point, index) =>
      Math.abs(point - position) < Math.abs(points[closest] - position) ? index : closest,
    0,
  );

interface ElementObserver {
  observe: (element: HTMLElement) => void;
  unobserve: (element: HTMLElement) => void;
}

class SlideRegistry {
  private readonly slides = new Set<HTMLElement>();
  private readonly observers = new Set<ElementObserver>();

  register(element: HTMLElement): () => void {
    this.slides.add(element);
    for (const observer of this.observers) observer.observe(element);
    return () => {
      this.slides.delete(element);
      for (const observer of this.observers) observer.unobserve(element);
    };
  }

  watch(observer: ElementObserver): () => void {
    this.observers.add(observer);
    for (const slide of this.slides) observer.observe(slide);
    return () => this.observers.delete(observer);
  }
}

export type CarouselRoot = ReturnType<typeof useCarouselRoot>;

/** The state and handlers every carousel part reads from its root. */
export function useCarouselRoot({
  slideCount,
  value,
  defaultValue = 0,
  onValueChange,
  orientation = "horizontal",
  slidesPerPage = 1,
  slidesPerMove = "auto",
  spacing,
  peek,
  loop: loopProp,
  autoplay = false,
  allowMouseDrag = false,
  autoSize = false,
  inViewThreshold = 0.6,
  translations,
}: CarouselRootOptions) {
  const uid = useId();
  const dir = useLocale().dir;
  const rtl = dir === "rtl";
  const horizontal = orientation === "horizontal";
  const loop = loopProp ?? Boolean(autoplay);
  const delay = typeof autoplay === "object" ? autoplay.delay : AUTOPLAY_DELAY;

  const [page, setPage] = useControllableState({ value, defaultValue });
  const [snapPoints, setSnapPoints] = useState<readonly number[]>(() =>
    autoSize
      ? Array.from({ length: slideCount }, (_, index) => index)
      : getPageSnapPoints(slideCount, slidesPerMove, slidesPerPage),
  );
  const [inView, setInView] = useState<readonly number[]>([]);
  const [playing, setPlaying] = useState(Boolean(autoplay));
  const [autoplayOn, setAutoplayOn] = useState(Boolean(autoplay));
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [itemGroup, setItemGroupElement] = useState<HTMLElement | null>(null);

  if (autoplayOn !== Boolean(autoplay)) {
    setAutoplayOn(Boolean(autoplay));
    setPlaying(Boolean(autoplay));
  }

  const lastPage = snapPoints.length - 1;
  const activePage = snapPoints.length ? clampValue(page, 0, lastPage) : 0;
  const canScrollPrev = loop || page > 0;
  const canScrollNext = loop || page < lastPage;
  const running = playing && !hovered && !focused && !pageHidden;

  const latest = useLatestRef({ page, snapPoints, horizontal, loop, onValueChange, canScrollNext });
  const elementRef = useRef<HTMLElement | null>(null);
  const modeRef = useRef<Mode>("idle");
  const stopScrollEndRef = useRef<(() => void) | undefined>(undefined);
  const stopDragRef = useRef<(() => void) | undefined>(undefined);
  const swipeOriginRef = useRef<{ x: number; y: number } | null>(null);
  const touchingRef = useRef(false);
  const pointerTypeRef = useRef("mouse");
  const lastWheelRef = useRef(0);
  const [slides] = useState(() => new SlideRegistry());
  const [indicators] = useState(() => new CompositeList());
  const [autoplayTriggers] = useState(() => new Set<HTMLElement>());

  const scrollToPage = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const element = elementRef.current;
      const points = latest.current.snapPoints;
      if (!element || !points.length) return;
      const position = points[clampValue(index, 0, points.length - 1)];
      element.scrollTo({ [latest.current.horizontal ? "left" : "top"]: position, behavior });
    },
    [latest],
  );

  const commitPage = useCallback(
    (next: number, reason: CarouselValueChangeReason, event?: Event) => {
      const current = latest.current.page;
      if (next === current) return false;
      if (!emitChange(latest.current.onValueChange, next, reason, event)) {
        if (reason === "scroll") scrollToPage(current, "smooth");
        return false;
      }
      setPage(next);
      return true;
    },
    [latest, scrollToPage, setPage],
  );

  const pageAt = useCallback(
    (target: ListTarget, wrap: boolean) => {
      const { page: current, snapPoints: points } = latest.current;
      const count = points.length;
      if (!count) return current;
      const pages = { length: count, isDisabled: () => false };
      return getTargetIndex(pages, clampValue(current, 0, count - 1), target, wrap);
    },
    [latest],
  );

  const enter = useCallback((mode: Mode) => {
    stopScrollEndRef.current?.();
    stopScrollEndRef.current = undefined;
    modeRef.current = mode;
    setDragging(mode === "dragging" || mode === "settling");
  }, []);

  const settleToClosestPage = useCallback(() => {
    const element = elementRef.current;
    const { snapPoints: points, horizontal: alongX } = latest.current;
    enter("idle");
    if (!element || !points.length) return;
    commitPage(closestIndex(points, alongX ? element.scrollLeft : element.scrollTop), "scroll");
  }, [commitPage, enter, latest]);

  const trackScrollEnd = useCallback(
    (wait: number, immediate: boolean) => {
      const element = elementRef.current;
      if (!element) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const settle = () => {
        if (!touchingRef.current) settleToClosestPage();
      };
      const restart = () => {
        clearTimeout(timer);
        timer = setTimeout(settle, wait);
      };
      if (immediate) restart();
      element.addEventListener("scroll", restart, { passive: true });
      element.addEventListener("touchend", restart);
      element.addEventListener("touchcancel", restart);
      stopScrollEndRef.current = () => {
        clearTimeout(timer);
        element.removeEventListener("scroll", restart);
        element.removeEventListener("touchend", restart);
        element.removeEventListener("touchcancel", restart);
      };
    },
    [settleToClosestPage],
  );

  const measure = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;
    const alongX = latest.current.horizontal;
    if ((alongX ? element.offsetWidth : element.offsetHeight) === 0) return;
    const points = getScrollSnapPositions(element, alongX ? "x" : "y");
    setSnapPoints((previous) => (sameItems(previous, points) ? previous : points));
    if (!points.length) return;
    const current = latest.current.page;
    const clamped = clampValue(current, 0, points.length - 1);
    if (clamped !== current) commitPage(clamped, "layout-change");
  }, [commitPage, latest]);

  const navigate = (next: number, reason: CarouselValueChangeReason, event?: Event) => {
    setPlaying(false);
    if (modeRef.current !== "dragging") enter("idle");
    return commitPage(next, reason, event);
  };

  const keyTarget = (key: string): number | null => {
    const target = getKeyTarget(key, orientation, rtl);
    return target && pageAt(target, loop);
  };

  const startUserScroll = () => {
    if (modeRef.current !== "idle") return;
    setPlaying(false);
    enter("userScroll");
    trackScrollEnd(USER_SCROLL_END_DELAY, false);
  };

  const endTouch = (event: TouchEvent<HTMLElement>) => {
    if (event.touches.length > 0) return;
    touchingRef.current = false;
    swipeOriginRef.current = null;
  };

  const startDrag = (element: HTMLElement, startX: number, startY: number) => {
    setPlaying(false);
    enter("dragging");
    let moved = false;
    const onEnd = (event: Event) => {
      stopDragRef.current?.();
      if (moved && event.type === "pointerup") swallowNextClick(element.ownerDocument);
      const { snapPoints: points, horizontal: alongX } = latest.current;
      enter("settling");
      const target = closestIndex(points, alongX ? element.scrollLeft : element.scrollTop);
      requestAnimationFrame(() => scrollToPage(target, "smooth"));
      trackScrollEnd(SETTLE_END_DELAY, true);
    };
    const stopTracking = trackPointerMove(element.ownerDocument, {
      onMove: ({ x, y }, event) => {
        moved ||= Math.hypot(x - startX, y - startY) > SWIPE_DISTANCE;
        element.scrollBy({ left: -event.movementX, top: -event.movementY, behavior: "instant" });
      },
      onUp: onEnd,
    });
    stopDragRef.current = () => {
      stopDragRef.current = undefined;
      stopTracking();
    };
  };

  const setItemGroup = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    setItemGroupElement(element);
  }, []);

  const registerItem = useCallback(
    (element: HTMLElement | null) => (element ? slides.register(element) : undefined),
    [slides],
  );

  useEffect(
    () => () => {
      stopScrollEndRef.current?.();
      stopDragRef.current?.();
    },
    [],
  );

  useLayoutEffect(() => {
    if (!itemGroup) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(itemGroup, { box: "border-box" });
    const unwatch = slides.watch({
      observe: (element) => resize.observe(element, { box: "border-box" }),
      unobserve: (element) => resize.unobserve(element),
    });
    let frame = requestAnimationFrame(() => {
      measure();
      frame = requestAnimationFrame(() => scrollToPage(latest.current.page, "instant"));
    });
    return () => {
      cancelAnimationFrame(frame);
      unwatch();
      resize.disconnect();
    };
  }, [itemGroup, slides, latest, measure, scrollToPage]);

  useLayoutEffect(measure, [
    measure,
    orientation,
    autoSize,
    rtl,
    slideCount,
    slidesPerPage,
    slidesPerMove,
  ]);

  const thresholdKey = String(inViewThreshold);
  useLayoutEffect(() => {
    if (!itemGroup) return;
    const intersection = new IntersectionObserver(
      (entries) =>
        setInView((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const index = Number((entry.target as HTMLElement).dataset.index ?? "-1");
            if (Number.isNaN(index) || index === -1) continue;
            if (entry.isIntersecting) next.add(index);
            else next.delete(index);
          }
          const values = [...next];
          return sameItems(previous, values) ? previous : values;
        }),
      { root: itemGroup, threshold: thresholdKey.split(",").map(Number) },
    );
    const unwatch = slides.watch(intersection);
    return () => {
      unwatch();
      intersection.disconnect();
    };
  }, [itemGroup, slides, thresholdKey]);

  const snapKey = snapPoints.join(",");
  const previousSnapKeyRef = useRef(snapKey);
  useLayoutEffect(() => {
    if (previousSnapKeyRef.current === snapKey) return;
    previousSnapKeyRef.current = snapKey;
    const element = elementRef.current;
    const point = snapPoints[page];
    if (!element || point == null || modeRef.current !== "idle") return;
    const position = horizontal ? element.scrollLeft : element.scrollTop;
    if (Math.abs(position - point) <= DRIFT_THRESHOLD) return;
    element.scrollTo({ [horizontal ? "left" : "top"]: point, behavior: "instant" });
  }, [snapKey, snapPoints, page, horizontal]);

  const previousPageRef = useRef(page);
  useLayoutEffect(() => {
    if (previousPageRef.current === page) return;
    previousPageRef.current = page;
    scrollToPage(page, "smooth");
  }, [page, scrollToPage]);

  useEffect(() => {
    if (!playing) return;
    const onVisibilityChange = () => setPageHidden(document.visibilityState !== "visible");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [playing]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      if (!latest.current.canScrollNext) setPlaying(false);
      else commitPage(pageAt("next", true), "autoplay");
    }, delay);
    return () => clearInterval(timer);
  }, [running, delay, latest, commitPage, pageAt]);

  const focusIndicatorAfter = (moved: boolean, next: number) => {
    if (moved) indicators.find(String(next))?.element.focus({ preventScroll: true });
  };

  const translated = { ...DEFAULT_TRANSLATIONS, ...translations };
  const perMove = resolveSlidesPerMove(slidesPerMove, slidesPerPage);

  return {
    dir,
    orientation,
    slideCount,
    slidesPerPage,
    spacing,
    peek,
    page: activePage,
    pageCount: snapPoints.length,
    canScrollPrev,
    canScrollNext,
    playing,
    running,
    dragging,
    inView,
    translations: translated,
    itemGroupId: `carousel:${uid}:item-group`,
    mountedItemGroupId: itemGroup?.id || undefined,
    setItemGroup,
    registerItem,
    indicators,
    autoplayTriggers,
    snapsAt: (index: number) => (index + perMove) % perMove === 0,
    prev(event: Event) {
      navigate(pageAt("prev", loop), "prev-press", event);
    },
    next(event: Event) {
      navigate(pageAt("next", loop), "next-press", event);
    },
    goToIndicator(index: number, reason: CarouselValueChangeReason, event: Event) {
      focusIndicatorAfter(navigate(index, reason, event), index);
    },
    togglePlaying() {
      setPlaying((current) => !current);
    },
    rootProps: {
      onPointerEnter(event: PointerEvent<HTMLElement>) {
        if (event.pointerType !== "touch") setHovered(true);
      },
      onPointerLeave() {
        setHovered(false);
      },
      onFocus(event: FocusEvent<HTMLElement>) {
        setFocused(!(event.target instanceof HTMLElement && autoplayTriggers.has(event.target)));
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      },
    },
    indicatorKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented || isComposingEvent(event)) return;
      const target = keyTarget(event.key);
      if (target === null) return;
      event.preventDefault();
      focusIndicatorAfter(navigate(target, "keyboard", event.nativeEvent), target);
    },
    itemGroupProps: {
      onKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.defaultPrevented || isComposingEvent(event) || ownsArrowKeys(event.target)) {
          return;
        }
        const target = keyTarget(event.key);
        if (target === null) return;
        event.preventDefault();
        navigate(target, "keyboard", event.nativeEvent);
      },
      onWheel(event: WheelEvent<HTMLElement>) {
        const delta = horizontal ? event.deltaX : event.deltaY;
        if (delta === 0) return;
        const backward = horizontal && rtl ? delta > 0 : delta < 0;
        if (backward ? !canScrollPrev : !canScrollNext) return;
        if (event.timeStamp - lastWheelRef.current < WHEEL_THROTTLE) return;
        lastWheelRef.current = event.timeStamp;
        startUserScroll();
      },
      onTouchStart(event: TouchEvent<HTMLElement>) {
        touchingRef.current = true;
        const { clientX: x, clientY: y } = event.touches[0];
        swipeOriginRef.current = modeRef.current === "idle" ? { x, y } : null;
      },
      onTouchMove(event: TouchEvent<HTMLElement>) {
        const origin = swipeOriginRef.current;
        if (!origin) return;
        const { clientX, clientY } = event.touches[0];
        const along = Math.abs(horizontal ? clientX - origin.x : clientY - origin.y);
        const across = Math.abs(horizontal ? clientY - origin.y : clientX - origin.x);
        if (along < SWIPE_DISTANCE || along < across) return;
        swipeOriginRef.current = null;
        startUserScroll();
      },
      onTouchEnd: endTouch,
      onTouchCancel: endTouch,
      onPointerDown(event: PointerEvent<HTMLElement>) {
        pointerTypeRef.current = event.pointerType;
      },
      onMouseDown(event: MouseEvent<HTMLElement>) {
        if (event.defaultPrevented || !allowMouseDrag || event.button !== 0) return;
        if (pointerTypeRef.current !== "mouse" || modeRef.current === "dragging") return;
        if (pressesFocusable(event.target as Element, event.currentTarget)) return;
        event.preventDefault();
        startDrag(event.currentTarget, event.clientX, event.clientY);
      },
    },
  };
}
