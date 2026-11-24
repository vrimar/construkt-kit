import { type KeyboardEvent, useCallback, useLayoutEffect, useRef } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import { useFocusClaim } from "./focusClaims";
import { recordFocusHandoff, resolveReturnTarget } from "./focusHandoff";
import { findInitialFocus, getTabbables } from "./tabbable";

export interface UseModalFocusOptions {
  open: boolean;
  /** The modal `<dialog>`, which takes focus when its content has nothing to focus. */
  dialog: HTMLElement | null;
  /** Where initial focus looks for a `findInitialFocus` element; it mounts once the dialog shows. */
  content: HTMLElement | null;
  /**
   * The element to focus on open, even over an `autoFocus` field; `null` leaves it to the default,
   * and `false` leaves focus to the content itself.
   */
  initialFocus?: ((dialog: HTMLElement) => HTMLElement | null | false) | undefined;
}

export interface ModalFocus {
  /** Keeps Tab and Shift+Tab cycling through the dialog. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/** Focuses into a modal dialog whenever it opens, mounted open or not, and keeps Tab inside it. */
export function useModalFocus(options: UseModalFocusOptions): ModalFocus {
  const { open, dialog, content } = options;
  const latest = useLatestRef(options);
  useFocusClaim(open);

  useLayoutEffect(() => {
    if (!open || !dialog || !content) return;
    const chosen = latest.current.initialFocus?.(dialog);
    if (chosen === false) return;
    if (!chosen && content.contains(content.ownerDocument.activeElement)) return;
    (chosen ?? findInitialFocus(content) ?? dialog).focus({ preventScroll: true });
  }, [open, dialog, content, latest]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey) return;
    const container = event.currentTarget;
    const tabbables = getTabbables(container);
    const first = tabbables[0];
    const last = tabbables.at(-1);
    const active = container.ownerDocument.activeElement;
    if (!first || !last) {
      event.preventDefault();
    } else if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  return { onKeyDown };
}

export interface UseModalReturnFocusOptions {
  dialog: HTMLElement | null;
  /** Moves focus back when the dialog closes. */
  restoreFocus: boolean;
  /** The element focus returns to; the one focused before the dialog opened when it gives none. */
  returnFocusTo: () => HTMLElement | null;
}

export interface ModalReturnFocus {
  /**
   * Call right before `showModal()`, while focus is still where it was. Blurs it, so the browser
   * has nothing to restore on close and `returnFocus` alone moves it back.
   */
  captureReturnFocus: () => void;
  /** Call as the dialog closes, with whether focus was inside it or nowhere just before. */
  returnFocus: (focusLost: boolean) => void;
}

/** Remembers where focus was as a modal dialog opens and returns it there as it closes. */
export function useModalReturnFocus(options: UseModalReturnFocusOptions): ModalReturnFocus {
  const latest = useLatestRef(options);
  const previousRef = useRef<HTMLElement | null>(null);

  const captureReturnFocus = useCallback(() => {
    const active = document.activeElement;
    previousRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    previousRef.current?.blur();
  }, []);

  const returnFocus = useCallback(
    (focusLost: boolean) => {
      const target = resolveReturnTarget(latest.current.returnFocusTo() ?? previousRef.current);
      previousRef.current = null;
      recordFocusHandoff(latest.current.dialog, target);
      if (focusLost && latest.current.restoreFocus) target?.focus({ preventScroll: true });
    },
    [latest],
  );

  return { captureReturnFocus, returnFocus };
}
