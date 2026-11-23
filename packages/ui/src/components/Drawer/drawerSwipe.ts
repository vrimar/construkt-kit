import { clampValue } from "@construkt-kit/utils";
import {
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cssLengthToPx } from "../../foundations/cssSize";
import { isEditingControl } from "../../foundations/dom";
import { useLatestRef } from "../../hooks/useLatestRef";
import { usePointerDrag } from "../../hooks/usePointerDrag";
import {
  type SwipeDirection,
  isNoDragTarget,
  isVerticalSwipe,
  rubberBand,
  swipeDisplacement,
  swipeSign,
} from "../../primitives/drag";
import type { ModalSurface } from "../dialogParts";

/** A height a top or bottom drawer rests at: a fraction of the viewport up to 1, or px and rem. */
export type DrawerSnapPoint = number | `${number}px` | `${number}rem`;

const SNAP_VELOCITY_THRESHOLD = 0.4;
const SNAP_VELOCITY_MULTIPLIER = 400;
const MAX_SNAP_VELOCITY = 4;
const RELEASE_DISPLACEMENT_TRUST_PX = 24;
const VELOCITY_WINDOW_MS = 100;
const MAX_RELEASE_VELOCITY_AGE_MS = 80;
const MOUSE_DRAG_THRESHOLD_PX = 6;
const MOUSE_DRAG_MAIN_OVER_CROSS = 1.35;
const TOUCH_CROSS_AXIS_BIAS = 0.58;
const SCROLL_EPSILON = 1;

function resolveSnapHeight(point: DrawerSnapPoint, viewport: number, html: Element) {
  if (typeof point === "number") return point <= 1 ? clampValue(point, 0, 1) * viewport : point;
  return cssLengthToPx(point, html);
}

interface ResolvedSnapPoint {
  value: DrawerSnapPoint;
  offset: number;
}

/** Each snap point's distance from fully open, for content `size` px along the swipe axis. */
function resolveSnapPoints(points: readonly DrawerSnapPoint[], size: number): ResolvedSnapPoint[] {
  const html = document.documentElement;
  const viewport = html.clientHeight;
  const max = Math.min(size, viewport);
  return points.flatMap((value) => {
    const height = resolveSnapHeight(value, viewport, html);
    return height === null
      ? []
      : [{ value, offset: Math.max(0, size - clampValue(height, 0, max)) }];
  });
}

const closestTo = (points: ResolvedSnapPoint[], offset: number) =>
  points.reduce<ResolvedSnapPoint | null>(
    (closest, point) =>
      closest === null || Math.abs(point.offset - offset) < Math.abs(closest.offset - offset)
        ? point
        : closest,
    null,
  );

/** Presses on fields, `[data-no-drag]` elements and nested popups never swipe the drawer. */
function isSwipeExempt(target: EventTarget | null, content: HTMLElement) {
  if (!(target instanceof Element) || !content.contains(target)) return true;
  if (isNoDragTarget(target)) return true;
  const popup = target.closest("[popover]");
  if (popup && content.contains(popup)) return true;
  for (let node: Element | null = target; node && node !== content; node = node.parentElement) {
    if (isEditingControl(node)) return true;
  }
  return false;
}

function hasTextSelectionIn(content: HTMLElement) {
  const selection = content.ownerDocument.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
  return content.contains(selection.getRangeAt(0).commonAncestorContainer);
}

function canScrollOnAxis(element: Element, vertical: boolean, style = getComputedStyle(element)) {
  const overflow = vertical ? style.overflowY : style.overflowX;
  if (!/auto|scroll|overlay/.test(overflow)) return false;
  return vertical
    ? element.scrollHeight > element.clientHeight + SCROLL_EPSILON
    : element.scrollWidth > element.clientWidth + SCROLL_EPSILON;
}

// Its scroll position runs from 0 at that edge down to minus its range.
function scrollsFromBottomOrRight(style: CSSStyleDeclaration, vertical: boolean) {
  const flexDirection = style.display.endsWith("flex") ? style.flexDirection : "row";
  if (vertical) return flexDirection === "column-reverse";
  return (style.direction === "rtl") !== (flexDirection === "row-reverse");
}

/**
 * Whether a touch moving `main` px towards dismissal (negative: away from it) drags the drawer
 * rather than scrolling something between `target` and the content.
 */
function touchDragsDrawer(
  target: Element,
  content: HTMLElement,
  direction: SwipeDirection,
  main: number,
) {
  const vertical = isVerticalSwipe(direction);
  for (let node: Element | null = target; node && node !== content; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (!canScrollOnAxis(node, vertical, style)) continue;
    const max = vertical
      ? node.scrollHeight - node.clientHeight
      : node.scrollWidth - node.clientWidth;
    const scrolled = vertical ? node.scrollTop : node.scrollLeft;
    const fromTopOrLeft = scrollsFromBottomOrRight(style, vertical) ? max + scrolled : scrolled;
    const atTopOrLeft = fromTopOrLeft <= SCROLL_EPSILON;
    const atBottomOrRight = fromTopOrLeft >= max - SCROLL_EPSILON;
    const dismissesDownOrRight = direction === "down" || direction === "right";
    const towardDismiss = main > 0;
    const atEdgeAhead = towardDismiss === dismissesDownOrRight ? atTopOrLeft : atBottomOrRight;
    if (!atEdgeAhead) return false;
  }
  return true;
}

function crossAxisScrolls(target: Element, content: HTMLElement, direction: SwipeDirection) {
  for (let node: Element | null = target; node && node !== content; node = node.parentElement) {
    if (canScrollOnAxis(node, !isVerticalSwipe(direction))) return true;
  }
  return false;
}

interface Sample {
  displacement: number;
  time: number;
}

interface Gesture {
  startX: number;
  startY: number;
  rest: number;
  offset: number;
  samples: Sample[];
}

export interface UseDrawerSwipeOptions {
  surface: ModalSurface;
  direction: SwipeDirection;
  snapPoints: readonly DrawerSnapPoint[] | undefined;
  snapPoint: DrawerSnapPoint | null;
  setSnapPoint: (point: DrawerSnapPoint) => void;
  resetSnapPoint: () => void;
  /** `true` lets the mouse drag the content too; `false` leaves only the grabber. */
  draggable: boolean | "true" | "false" | undefined;
}

export interface DrawerSwipe {
  contentProps: {
    "data-swipe-direction": SwipeDirection;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onTouchStart: (event: ReactTouchEvent<HTMLElement>) => void;
  };
  grabberProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  };
}

/**
 * Lets the drawer follow a swipe towards `direction` and, on release, close or settle on the snap
 * point the swipe's position and speed point at. Touch swipes on the content yield to anything
 * inside it that can still scroll that way; the mouse swipes from the grabber, or from the content
 * when `draggable`.
 */
export function useDrawerSwipe(options: UseDrawerSwipeOptions): DrawerSwipe {
  const { surface, direction, snapPoints, snapPoint } = options;
  const { content, open } = surface;
  const latest = useLatestRef(options);
  const gestureRef = useRef<Gesture | null>(null);
  const restRef = useRef(0);
  const sizeRef = useRef(0);
  const vertical = isVerticalSwipe(direction);
  const snapKey = snapPoints?.join("|") ?? "";

  const resolved = useCallback(() => {
    const points = latest.current.snapPoints;
    if (!points?.length || !isVerticalSwipe(latest.current.direction)) return [];
    return resolveSnapPoints(points, sizeRef.current);
  }, [latest]);

  const applyOffset = useCallback(
    (offset: number) => {
      const element = latest.current.surface.content;
      if (!element) return;
      const travel = swipeSign(latest.current.direction) * offset;
      element.style.setProperty(
        "transform",
        isVerticalSwipe(latest.current.direction)
          ? `translate3d(0px, ${travel}px, 0)`
          : `translate3d(${travel}px, 0px, 0)`,
      );
    },
    [latest],
  );

  const applyProgress = useCallback(
    (progress: number) => {
      latest.current.surface.dialog?.style.setProperty("--drawer-swipe-progress", String(progress));
    },
    [latest],
  );

  const setSwiping = useCallback(
    (swiping: boolean) => {
      latest.current.surface.content?.toggleAttribute("data-swiping", swiping);
    },
    [latest],
  );

  const settle = useCallback(() => {
    if (!content) return;
    sizeRef.current = vertical ? content.offsetHeight : content.offsetWidth;
    const point = latest.current.snapPoint;
    restRef.current =
      resolved().find((candidate) => Object.is(candidate.value, point))?.offset ?? 0;
    if (!gestureRef.current) applyOffset(restRef.current);
  }, [content, vertical, latest, resolved, applyOffset]);

  useLayoutEffect(() => {
    settle();
  }, [settle, snapPoint, snapKey]);

  useEffect(() => {
    if (!content || !snapKey) return;
    const observer = new ResizeObserver(() => settle());
    observer.observe(content);
    window.addEventListener("resize", settle);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", settle);
    };
  }, [content, snapKey, settle]);

  useEffect(() => () => latest.current.resetSnapPoint(), [latest]);

  const stopTouchRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    return () => {
      stopTouchRef.current?.();
      if (!gestureRef.current) return;
      gestureRef.current = null;
      setSwiping(false);
    };
  }, [open, setSwiping]);

  // Counted so a swipe-dismiss the owner of `open` ignores still commits, and the drawer settles back.
  const [dismissRequests, setDismissRequests] = useState(0);
  useLayoutEffect(() => {
    if (!open || gestureRef.current) return;
    applyProgress(0);
    applyOffset(restRef.current);
  }, [dismissRequests, open, applyProgress, applyOffset]);

  const begin = (x: number, y: number) => {
    if (!content) return;
    sizeRef.current = vertical ? content.offsetHeight : content.offsetWidth;
    gestureRef.current = {
      startX: x,
      startY: y,
      rest: restRef.current,
      offset: restRef.current,
      samples: [],
    };
    setSwiping(true);
  };

  const move = (x: number, y: number, time: number) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const displacement = swipeDisplacement(direction, x - gesture.startX, y - gesture.startY);
    gesture.offset = rubberBand(gesture.rest + displacement, true, false);
    applyOffset(gesture.offset);
    const travel = sizeRef.current - gesture.rest;
    applyProgress(travel > 0 ? clampValue((gesture.offset - gesture.rest) / travel, 0, 1) : 0);
    gesture.samples.push({ displacement, time });
    while (
      gesture.samples.length > 2 &&
      time - (gesture.samples[0]?.time ?? time) > VELOCITY_WINDOW_MS
    ) {
      gesture.samples.shift();
    }
  };

  const releaseVelocity = (gesture: Gesture, time: number) => {
    const first = gesture.samples[0];
    const last = gesture.samples.at(-1);
    if (!first || !last || last === first || time - last.time > MAX_RELEASE_VELOCITY_AGE_MS) {
      return 0;
    }
    const elapsed = last.time - first.time;
    return elapsed > 0 ? (last.displacement - first.displacement) / elapsed : 0;
  };

  const end = (time: number, event?: Event) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const { offset, rest } = gesture;
    let velocity = releaseVelocity(gesture, time);
    // A flick back at the end of a long drag doesn't outweigh where the drag let go.
    if (
      Math.abs(offset - rest) >= RELEASE_DISPLACEMENT_TRUST_PX &&
      Math.sign(velocity) !== Math.sign(offset - rest)
    ) {
      velocity = 0;
    }
    let target = offset;
    if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const fling =
        clampValue(velocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY) * SNAP_VELOCITY_MULTIPLIER;
      target = Math.max(0, target + fling);
    }
    const points = resolved();
    const closest = closestTo(points, target);
    const restingAt = closest?.offset ?? 0;
    const dismiss = Math.abs(target - sizeRef.current) < Math.abs(target - restingAt);
    gestureRef.current = null;
    setSwiping(false);
    if (dismiss && surface.requestOpenChange(false, "swipe", event)) {
      setDismissRequests((count) => count + 1);
      return;
    }
    applyProgress(0);
    // The rest offset moves only once `snapPoint` does, so an owner that keeps it settles back.
    if (!dismiss && closest && !Object.is(closest.value, latest.current.snapPoint)) {
      latest.current.setSnapPoint(closest.value);
    }
    applyOffset(restRef.current);
  };

  const cancel = () => {
    if (!gestureRef.current) return;
    gestureRef.current = null;
    setSwiping(false);
    applyProgress(0);
    applyOffset(restRef.current);
  };

  const canPress = (event: ReactPointerEvent<HTMLElement>) =>
    surface.open &&
    content !== null &&
    event.target instanceof Element &&
    event.target.closest("dialog") === surface.dialog;

  const pointerHandlers = (fromContent: boolean) => ({
    threshold: fromContent ? MOUSE_DRAG_THRESHOLD_PX : 0,
    onPress: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch" && fromContent) return false;
      if (!canPress(event) || !content) return false;
      if (fromContent) {
        const { draggable } = latest.current;
        if (draggable === false || draggable === "false") return false;
        if (event.pointerType === "mouse" && draggable === undefined) return false;
        if (isSwipeExempt(event.target, content) || hasTextSelectionIn(content)) return false;
      }
      return true;
    },
    onStart: (point: { clientX: number; clientY: number; deltaX: number; deltaY: number }) => {
      const main = Math.abs(vertical ? point.deltaY : point.deltaX);
      const cross = Math.abs(vertical ? point.deltaX : point.deltaY);
      if (fromContent && main < cross * MOUSE_DRAG_MAIN_OVER_CROSS) return;
      begin(point.clientX - point.deltaX, point.clientY - point.deltaY);
    },
    onMove: (point: { clientX: number; clientY: number }) => {
      move(point.clientX, point.clientY, performance.now());
    },
    onEnd: (_point: unknown, { cancelled }: { cancelled: boolean }) => {
      if (cancelled) cancel();
      else end(performance.now());
    },
  });

  const grabberDrag = usePointerDrag<HTMLElement>(pointerHandlers(false));
  const contentDrag = usePointerDrag<HTMLElement>(pointerHandlers(true));

  const onTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    const target = event.target;
    if (!touch || event.touches.length > 1 || !surface.open || !content) return;
    // A stylus also fires pointer events, which the pointer drag already follows.
    if ((touch as { touchType?: string }).touchType === "stylus") return;
    if (!(target instanceof Element) || target.closest("dialog") !== surface.dialog) return;
    if (target.closest('[data-slot="grabber"]')) return;
    const { draggable } = latest.current;
    if (draggable === false || draggable === "false") return;
    if (isSwipeExempt(target, content) || hasTextSelectionIn(content)) return;

    const doc = content.ownerDocument;
    let startX = touch.clientX;
    let startY = touch.clientY;
    let tracking = true;

    const stop = () => {
      if (stopTouchRef.current === stop) stopTouchRef.current = null;
      doc.removeEventListener("touchmove", onMove, true);
      doc.removeEventListener("touchend", onEnd, true);
      doc.removeEventListener("touchcancel", onCancel, true);
    };

    const onMove = (moveEvent: TouchEvent) => {
      const current = moveEvent.touches[0];
      if (!current || moveEvent.touches.length > 1) {
        stop();
        cancel();
        return;
      }
      if (!gestureRef.current) {
        if (!tracking) return;
        const main = swipeDisplacement(
          direction,
          current.clientX - startX,
          current.clientY - startY,
        );
        const cross = vertical ? current.clientX - startX : current.clientY - startY;
        if (Math.abs(main) < SCROLL_EPSILON && Math.abs(cross) < SCROLL_EPSILON) return;
        if (
          Math.abs(cross) > Math.abs(main) * TOUCH_CROSS_AXIS_BIAS &&
          crossAxisScrolls(target, content, direction)
        ) {
          tracking = false;
          return;
        }
        if (!moveEvent.cancelable || !touchDragsDrawer(target, content, direction, main)) {
          startX = current.clientX;
          startY = current.clientY;
          return;
        }
        begin(startX, startY);
      }
      moveEvent.preventDefault();
      move(current.clientX, current.clientY, moveEvent.timeStamp);
    };

    const onEnd = (endEvent: TouchEvent) => {
      if (endEvent.touches.length > 0) return;
      stop();
      end(endEvent.timeStamp, endEvent);
    };

    const onCancel = () => {
      stop();
      cancel();
    };

    stopTouchRef.current = stop;
    doc.addEventListener("touchmove", onMove, { capture: true, passive: false });
    doc.addEventListener("touchend", onEnd, true);
    doc.addEventListener("touchcancel", onCancel, true);
  };

  return {
    contentProps: {
      "data-swipe-direction": direction,
      onPointerDown: contentDrag.onPointerDown,
      onTouchStart,
    },
    grabberProps: { onPointerDown: grabberDrag.onPointerDown },
  };
}
