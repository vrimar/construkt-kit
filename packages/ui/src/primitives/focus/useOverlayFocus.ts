import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { OpenChangeReason } from "../layer";
import { recordFocusHandoff, resolveReturnTarget } from "./focusHandoff";
import { getInitialFocus, isWithinFocusable } from "./tabbable";

export interface UseOverlayFocusOptions {
  open: boolean;
  popup: HTMLElement | null;
  /** Moves focus into the popup when it opens. */
  autoFocus: boolean;
  /** Overrides the element focused on open; `false` focuses nothing. */
  initialFocus?: ((popup: HTMLElement) => HTMLElement | null | false) | undefined;
  /** Moves focus back when the popup closes. */
  restoreFocus: boolean;
  returnFocusTo: () => HTMLElement | null;
}

export interface ReturnFocusIntent {
  /** Returns focus even once it has moved on; without it, focus returns only if it would be lost. */
  restore: boolean;
  focusVisible: boolean;
}

export const KEEP_FOCUS: ReturnFocusIntent = { restore: false, focusVisible: false };
export const RESTORE_FOCUS: ReturnFocusIntent = { restore: true, focusVisible: false };

/**
 * How focus returns once a popup closes for `reason`: visibly after Escape, and only if it would
 * be lost when focus left it or the press that closed it landed on something that takes focus.
 */
export function dismissFocusIntent(
  reason: OpenChangeReason,
  target: EventTarget | null,
): ReturnFocusIntent {
  if (reason === "escape-key") return { restore: true, focusVisible: true };
  if (reason === "focus-out" || isWithinFocusable(target)) return KEEP_FOCUS;
  return RESTORE_FOCUS;
}

/** How focus returns once a popup closes other than by dismissal: visibly when a key closed it. */
export function closeFocusIntent(event: Event | undefined): ReturnFocusIntent {
  const keyboard =
    event instanceof KeyboardEvent || (event instanceof MouseEvent && event.detail === 0);
  return { restore: true, focusVisible: keyboard };
}

export interface OverlayFocus {
  /** Call before closing to say how focus should return. */
  setReturnFocus: (intent: ReturnFocusIntent) => void;
  /** From closing until focus is back, or left where it was. */
  returningFocus: boolean;
}

function isFocusLost(popup: HTMLElement | null) {
  const active = (popup?.ownerDocument ?? document).activeElement;
  return !active || active === active.ownerDocument.body || (popup?.contains(active) ?? false);
}

/**
 * Focuses into a non-modal popup when it opens, unless it mounted open, and back to its trigger
 * a frame after it closes.
 */
export function useOverlayFocus(options: UseOverlayFocusOptions): OverlayFocus {
  const { open, popup, autoFocus } = options;
  const latest = useLatestRef(options);
  const intentRef = useRef(RESTORE_FOCUS);
  const wasOpenRef = useRef(open);

  const [closedOnce, setClosedOnce] = useState(!open);
  if (!open && !closedOnce) setClosedOnce(true);

  const [prevOpen, setPrevOpen] = useState(open);
  const [returningFocus, setReturningFocus] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setReturningFocus(!open);
  }

  useEffect(() => {
    if (!open || !popup || !autoFocus || !closedOnce) return;
    const frame = requestAnimationFrame(() => {
      if (popup.contains(popup.ownerDocument.activeElement)) return;
      const target = latest.current.initialFocus?.(popup) ?? getInitialFocus(popup);
      if (target) target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, popup, autoFocus, closedOnce, latest]);

  useEffect(() => {
    const closed = wasOpenRef.current && !open;
    wasOpenRef.current = open;
    const intent = intentRef.current;
    intentRef.current = RESTORE_FOCUS;
    if (!closed) return;
    const { popup: closing, restoreFocus, returnFocusTo } = latest.current;
    recordFocusHandoff(closing, returnFocusTo());
    const frame = requestAnimationFrame(() => {
      if (restoreFocus && (intent.restore || isFocusLost(closing))) {
        resolveReturnTarget(latest.current.returnFocusTo())?.focus({
          preventScroll: true,
          focusVisible: intent.focusVisible,
        });
      }
      setReturningFocus(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, latest]);

  const setReturnFocus = useCallback((intent: ReturnFocusIntent) => {
    intentRef.current = intent;
  }, []);

  return { setReturnFocus, returningFocus };
}
