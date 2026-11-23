import {
  type PointerEventHandler,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  lockTextSelection,
  swallowNextClick,
  trackPointerMove,
} from "../foundations/trackPointerMove";
import { type EdgeAutoScrollOptions, createEdgeAutoScroll } from "./edgeAutoScroll";
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

export interface UsePointerDragOptions<T extends Element> {
  /** Ignores presses while `true`. */
  disabled?: boolean;
  /** Distance in px the pointer must travel before the drag starts. Defaults to `0`, any movement. */
  threshold?: number;
  /** Calls `preventDefault()` and `stopPropagation()` on a primary-button press, before `onPress`. */
  claimPress?: boolean;
  /** Runs on a primary-button press; returning `false` ignores it. */
  onPress?: (event: ReactPointerEvent<T>) => boolean | void;
  onStart?: (point: PointerDragPoint) => void;
  /** Runs on every pointer move and every auto-scroll step once the drag has started. */
  onMove: (point: PointerDragPoint) => void;
  /**
   * Runs once per started drag; `cancelled` after Escape, a `pointercancel`, a context menu, or an
   * unmount mid-drag.
   */
  onEnd?: (point: PointerDragPoint, details: { cancelled: boolean }) => void;
  /**
   * Runs once per press `onPress` accepted, as it ends, after `onEnd`: `dragged` once the drag
   * started, `cancelled` as for `onEnd`.
   */
  onRelease?: (point: PointerDragPoint, details: { dragged: boolean; cancelled: boolean }) => void;
  /** Attribute set on the pressed element while a drag runs, such as `"data-resizing"`. */
  activeAttribute?: string;
  autoScroll?: EdgeAutoScrollOptions;
}

/**
 * Tracks a pointer drag that starts on the element given `onPointerDown`. Moves are followed on the
 * document, so the element may unmount mid-drag; Escape cancels; a mouse move with no button held
 * ends a press whose release was lost; the click that ends a drag is swallowed, and iOS selects no
 * text through it. With `autoScroll`, a pointer held near an edge scrolls the container and calls
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
      const { disabled, claimPress, onPress } = latestRef.current;
      if (disabled || cancelRef.current || !event.isPrimary || event.button !== 0) return;
      if (claimPress) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (onPress?.(event) === false) return;

      const target = event.currentTarget;
      const doc = target.ownerDocument;
      const { pointerId, pointerType } = event;
      const startX = event.clientX;
      const startY = event.clientY;
      const scroller = latestRef.current.autoScroll?.element ?? null;
      const startLeft = scroller?.scrollLeft ?? 0;
      const startTop = scroller?.scrollTop ?? 0;
      let clientX = startX;
      let clientY = startY;
      let phase: "pressed" | "dragging" | "cancelled" = "pressed";
      let activeAttribute: string | undefined;
      let releaseSelection: (() => void) | undefined;

      const point = (): PointerDragPoint => ({
        clientX,
        clientY,
        deltaX: clientX - startX + (scroller ? scroller.scrollLeft - startLeft : 0),
        deltaY: clientY - startY + (scroller ? scroller.scrollTop - startTop : 0),
        pointerType,
      });

      const edgeScroll = createEdgeAutoScroll(
        () => {
          const autoScroll = latestRef.current.autoScroll;
          return autoScroll && { ...autoScroll, element: scroller };
        },
        () => latestRef.current.onMove(point()),
      );

      const end = (cancelled: boolean) => {
        if (activeAttribute) target.toggleAttribute(activeAttribute, false);
        latestRef.current.onEnd?.(point(), { cancelled });
      };

      const onMove = (_point: unknown, move: PointerEvent) => {
        if (phase === "cancelled") return;
        clientX = move.clientX;
        clientY = move.clientY;
        if (phase === "pressed") {
          const threshold = latestRef.current.threshold ?? 0;
          if (Math.hypot(clientX - startX, clientY - startY) <= threshold) return;
          phase = "dragging";
          releaseSelection = lockTextSelection(doc);
          if (target.isConnected) target.setPointerCapture(pointerId);
          activeAttribute = latestRef.current.activeAttribute;
          if (activeAttribute) target.toggleAttribute(activeAttribute, true);
          latestRef.current.onStart?.(point());
        }
        latestRef.current.onMove(point());
        edgeScroll.update(clientX, clientY);
      };

      const finish = (released: boolean) => {
        const dragged = phase !== "pressed";
        const cancelled = !released || phase === "cancelled";
        if (phase === "dragging") end(cancelled);
        stop();
        latestRef.current.onRelease?.(point(), { dragged, cancelled });
        return dragged;
      };

      const onUp = (up: PointerEvent | MouseEvent) => {
        const released = up.type === "pointerup" || up.type === "pointermove";
        if (finish(released) && up.type === "pointerup") swallowNextClick(doc);
      };

      const onKeyDown = (key: KeyboardEvent) => {
        if (key.key !== "Escape" || phase !== "dragging") return;
        key.preventDefault();
        key.stopPropagation();
        phase = "cancelled";
        edgeScroll.stop();
        end(true);
      };

      const stopTracking = trackPointerMove(doc, {
        pointerId,
        lockSelection: false,
        onMove,
        onUp,
      });

      const stop = () => {
        edgeScroll.stop();
        stopTracking();
        releaseSelection?.();
        doc.removeEventListener("keydown", onKeyDown, { capture: true });
        cancelRef.current = null;
      };

      doc.addEventListener("keydown", onKeyDown, { capture: true });
      cancelRef.current = () => finish(false);
    },
    [latestRef],
  );

  return { onPointerDown };
}
