import {
  type PointerEventHandler,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useLatestRef } from "./useLatestRef";

export interface PointerDragPoint {
  /** Pointer position in the viewport. */
  clientX: number;
  clientY: number;
  /** Movement since the press in px of the scrolled content: pointer travel plus how far `autoScroll.element` has scrolled. */
  deltaX: number;
  deltaY: number;
  pointerType: string;
}

export interface PointerDragInset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface PointerDragAutoScroll {
  /** Scroll container that scrolls while the pointer is near or past its edges. */
  element: HTMLElement | null | undefined;
  /** Moves each edge zone inward, past sticky bands such as a header or pinned columns. A function is read every frame. */
  inset?: PointerDragInset | (() => PointerDragInset);
  /** Axes it scrolls. Defaults to `"both"`. */
  axis?: "x" | "y" | "both";
  /** Depth of each edge zone in px. Defaults to `40`. */
  edge?: number;
  /** Speed at the edge and beyond, in px per 60Hz frame. Defaults to `20`. */
  maxSpeed?: number;
}

export interface UsePointerDragOptions<T extends Element> {
  /** Tracks presses only while `true`. Defaults to `true`. */
  enabled?: boolean;
  /** Distance in px the pointer must travel before the drag starts. Defaults to `0`, any movement. */
  threshold?: number;
  /** Runs on a primary-button press; returning `false` ignores it. */
  onPress?: (event: ReactPointerEvent<T>) => boolean | void;
  onStart?: (point: PointerDragPoint) => void;
  /** Runs on every pointer move and every auto-scroll step once the drag has started. */
  onMove: (point: PointerDragPoint) => void;
  /** Runs once per started drag; `cancelled` after Escape, a `pointercancel`, or an unmount mid-drag. */
  onEnd?: (point: PointerDragPoint, details: { cancelled: boolean }) => void;
  autoScroll?: PointerDragAutoScroll;
}

const FRAME_MS = 1000 / 60;
const DEFAULT_EDGE = 40;
const DEFAULT_MAX_SPEED = 20;

const edgeVelocity = (position: number, start: number, end: number, edge: number, max: number) => {
  if (position < start + edge) return -max * Math.min(1, (start + edge - position) / edge);
  if (position > end - edge) return max * Math.min(1, (position - end + edge) / edge);
  return 0;
};

const wholePixels = (value: number) =>
  value === 0 ? 0 : Math.sign(value) * Math.max(1, Math.round(Math.abs(value)));

/**
 * Tracks a pointer drag that starts on the element given `onPointerDown`. Moves are followed on the
 * document, so the element may unmount mid-drag; Escape cancels; the click that ends a drag is
 * swallowed. With `autoScroll`, a pointer held near an edge scrolls the container and calls
 * `onMove` on every step, so the target under the pointer stays current. Give the element
 * `touch-action: none` to drag with touch.
 */
export function usePointerDrag<T extends Element = Element>(
  options: UsePointerDragOptions<T>,
): { onPointerDown: PointerEventHandler<T> } {
  const latestRef = useLatestRef(options);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<T>) => {
      const { enabled = true, onPress } = latestRef.current;
      if (!enabled || cancelRef.current || !event.isPrimary || event.button !== 0) return;
      if (onPress?.(event) === false) return;

      const target = event.currentTarget;
      const doc = target.ownerDocument;
      const view = doc.defaultView ?? window;
      const { pointerId, pointerType } = event;
      const startX = event.clientX;
      const startY = event.clientY;
      const scroller = latestRef.current.autoScroll?.element ?? null;
      const startLeft = scroller?.scrollLeft ?? 0;
      const startTop = scroller?.scrollTop ?? 0;
      let clientX = startX;
      let clientY = startY;
      let phase: "pressed" | "dragging" | "cancelled" = "pressed";
      let frame = 0;
      let lastTime = 0;

      const point = (): PointerDragPoint => ({
        clientX,
        clientY,
        deltaX: clientX - startX + (scroller ? scroller.scrollLeft - startLeft : 0),
        deltaY: clientY - startY + (scroller ? scroller.scrollTop - startTop : 0),
        pointerType,
      });

      const velocity = () => {
        const auto = latestRef.current.autoScroll;
        if (!scroller || !auto) return { x: 0, y: 0 };
        const rect = scroller.getBoundingClientRect();
        const inset = (typeof auto.inset === "function" ? auto.inset() : auto.inset) ?? {};
        const edge = auto.edge ?? DEFAULT_EDGE;
        const max = auto.maxSpeed ?? DEFAULT_MAX_SPEED;
        const axis = auto.axis ?? "both";
        const left = rect.left + (inset.left ?? 0);
        const right = rect.right - (inset.right ?? 0);
        const top = rect.top + (inset.top ?? 0);
        const bottom = rect.bottom - (inset.bottom ?? 0);
        return {
          x: axis === "y" ? 0 : edgeVelocity(clientX, left, right, edge, max),
          y: axis === "x" ? 0 : edgeVelocity(clientY, top, bottom, edge, max),
        };
      };

      const tick = (time: number) => {
        frame = 0;
        const { x, y } = velocity();
        if (!scroller || (x === 0 && y === 0)) {
          lastTime = 0;
          return;
        }
        const scale = lastTime ? Math.min(4, (time - lastTime) / FRAME_MS) : 1;
        lastTime = time;
        const { scrollLeft, scrollTop } = scroller;
        scroller.scrollBy({
          left: wholePixels(x * scale),
          top: wholePixels(y * scale),
          behavior: "instant",
        });
        if (scroller.scrollLeft !== scrollLeft || scroller.scrollTop !== scrollTop) {
          latestRef.current.onMove(point());
        }
        frame = view.requestAnimationFrame(tick);
      };

      const stopScrolling = () => {
        if (frame) view.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      };

      const swallowClick = () => {
        const swallow = (click: MouseEvent) => {
          click.stopPropagation();
          click.preventDefault();
        };
        doc.addEventListener("click", swallow, { capture: true, once: true });
        view.setTimeout(() => doc.removeEventListener("click", swallow, { capture: true }), 0);
      };

      const onMove = (move: PointerEvent) => {
        if (move.pointerId !== pointerId || phase === "cancelled") return;
        clientX = move.clientX;
        clientY = move.clientY;
        if (phase === "pressed") {
          const threshold = latestRef.current.threshold ?? 0;
          if (Math.hypot(clientX - startX, clientY - startY) <= threshold) return;
          phase = "dragging";
          if (target.isConnected) target.setPointerCapture(pointerId);
          latestRef.current.onStart?.(point());
        }
        latestRef.current.onMove(point());
        if (!frame) frame = view.requestAnimationFrame(tick);
      };

      const onUp = (up: PointerEvent) => {
        if (up.pointerId !== pointerId) return;
        const dragged = phase !== "pressed";
        if (phase === "dragging") latestRef.current.onEnd?.(point(), { cancelled: false });
        stop();
        if (dragged) swallowClick();
      };

      const abort = () => {
        if (phase === "dragging") latestRef.current.onEnd?.(point(), { cancelled: true });
        stop();
      };

      const onCancel = (cancel: PointerEvent) => {
        if (cancel.pointerId === pointerId) abort();
      };

      const onKeyDown = (key: KeyboardEvent) => {
        if (key.key !== "Escape" || phase !== "dragging") return;
        key.preventDefault();
        key.stopPropagation();
        phase = "cancelled";
        stopScrolling();
        latestRef.current.onEnd?.(point(), { cancelled: true });
      };

      const stop = () => {
        stopScrolling();
        doc.removeEventListener("pointermove", onMove);
        doc.removeEventListener("pointerup", onUp);
        doc.removeEventListener("pointercancel", onCancel);
        doc.removeEventListener("keydown", onKeyDown, { capture: true });
        cancelRef.current = null;
      };

      doc.addEventListener("pointermove", onMove);
      doc.addEventListener("pointerup", onUp);
      doc.addEventListener("pointercancel", onCancel);
      doc.addEventListener("keydown", onKeyDown, { capture: true });
      cancelRef.current = abort;
    },
    [latestRef],
  );

  return { onPointerDown };
}
