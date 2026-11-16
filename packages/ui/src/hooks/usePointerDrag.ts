import {
  type PointerEventHandler,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

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
  /** Runs once per started drag; `cancelled` after Escape, a `pointercancel`, or an unmount mid-drag. */
  onEnd?: (point: PointerDragPoint, details: { cancelled: boolean }) => void;
  /** Attribute set on the pressed element while a drag runs, such as `"data-resizing"`. */
  activeAttribute?: string;
  autoScroll?: EdgeAutoScrollOptions;
}

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
      const { disabled, claimPress, onPress } = latestRef.current;
      if (disabled || cancelRef.current || !event.isPrimary || event.button !== 0) return;
      if (claimPress) {
        event.preventDefault();
        event.stopPropagation();
      }
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
      let activeAttribute: string | undefined;

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
          activeAttribute = latestRef.current.activeAttribute;
          if (activeAttribute) target.toggleAttribute(activeAttribute, true);
          latestRef.current.onStart?.(point());
        }
        latestRef.current.onMove(point());
        edgeScroll.update(clientX, clientY);
      };

      const onUp = (up: PointerEvent) => {
        if (up.pointerId !== pointerId) return;
        const dragged = phase !== "pressed";
        if (phase === "dragging") end(false);
        stop();
        if (dragged) swallowClick();
      };

      const abort = () => {
        if (phase === "dragging") end(true);
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
        edgeScroll.stop();
        end(true);
      };

      const stop = () => {
        edgeScroll.stop();
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
