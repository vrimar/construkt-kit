import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { OpenChangeReason } from "../layer";
import { isFocusClaimedSince, lastFocusClaim, useFocusClaim } from "./focusClaims";
import { isFocusLost, recordFocusHandoff, resolveReturnTarget } from "./focusHandoff";
import { getInitialFocus } from "./tabbable";

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
  /** Shows the focus ring on the element focus returns to. */
  focusVisible: boolean;
}

export const QUIET_RETURN: ReturnFocusIntent = { focusVisible: false };

/** How focus returns once a popup closes for `reason`: visibly after Escape. */
export const dismissFocusIntent = (reason: OpenChangeReason): ReturnFocusIntent =>
  reason === "escape-key" ? { focusVisible: true } : QUIET_RETURN;

/** How focus returns once a popup closes other than by dismissal: visibly when a key closed it. */
export function closeFocusIntent(event: Event | undefined): ReturnFocusIntent {
  const keyboard =
    event instanceof KeyboardEvent || (event instanceof MouseEvent && event.detail === 0);
  return { focusVisible: keyboard };
}

export interface OverlayFocus {
  /** Call before closing to say how focus should return. */
  setReturnFocus: (intent: ReturnFocusIntent) => void;
  /** From closing until focus is back, or left where it was. */
  returningFocus: boolean;
}

/**
 * Focuses into a non-modal popup when it opens, mounted open or not, and back to its trigger a
 * frame after it closes, only if focus is still inside it or nowhere and no overlay that takes
 * focus has opened since.
 */
export function useOverlayFocus(options: UseOverlayFocusOptions): OverlayFocus {
  const { open, popup, autoFocus } = options;
  const latest = useLatestRef(options);
  const intentRef = useRef(QUIET_RETURN);
  const wasOpenRef = useRef(open);
  useFocusClaim(open && autoFocus);

  const [prevOpen, setPrevOpen] = useState(open);
  const [returningFocus, setReturningFocus] = useState(false);
  // Read as it closes: an overlay opening in the same commit claims focus after this, and counts.
  const [closedAt, setClosedAt] = useState(0);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setReturningFocus(!open);
    if (!open) setClosedAt(lastFocusClaim());
  }

  useEffect(() => {
    if (!open || !popup || !autoFocus) return;
    const frame = requestAnimationFrame(() => {
      if (popup.contains(popup.ownerDocument.activeElement)) return;
      const target = latest.current.initialFocus?.(popup) ?? getInitialFocus(popup);
      if (target) target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, popup, autoFocus, latest]);

  useEffect(() => {
    const closed = wasOpenRef.current && !open;
    wasOpenRef.current = open;
    const intent = intentRef.current;
    intentRef.current = QUIET_RETURN;
    if (!closed) return;
    const { popup: closing, restoreFocus, returnFocusTo } = latest.current;
    recordFocusHandoff(closing, returnFocusTo());
    const frame = requestAnimationFrame(() => {
      if (restoreFocus && !isFocusClaimedSince(closedAt) && isFocusLost(closing)) {
        resolveReturnTarget(latest.current.returnFocusTo())?.focus({
          preventScroll: true,
          focusVisible: intent.focusVisible,
        });
      }
      setReturningFocus(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, closedAt, latest]);

  const setReturnFocus = useCallback((intent: ReturnFocusIntent) => {
    intentRef.current = intent;
  }, []);

  return { setReturnFocus, returningFocus };
}
