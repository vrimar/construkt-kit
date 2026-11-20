import { type KeyboardEvent, useCallback, useLayoutEffect, useRef } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
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
  /** Moves focus back when the dialog closes. */
  restoreFocus: boolean;
  /** The element focus returns to; the one focused before the dialog opened when it gives none. */
  returnFocusTo: () => HTMLElement | null;
}

export interface ModalFocus {
  /** Call right before `showModal()`, while focus is still where it was. */
  captureReturnFocus: () => void;
  /** Call once the dialog has closed, when nothing outside it is inert any more. */
  returnFocus: () => void;
  /** Keeps Tab and Shift+Tab cycling through the dialog. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * Focuses into a modal dialog whenever it opens, mounted open or not, keeps Tab inside it, and
 * returns focus once it has closed.
 */
export function useModalFocus(options: UseModalFocusOptions): ModalFocus {
  const { open, dialog, content } = options;
  const latest = useLatestRef(options);
  const previousRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !dialog || !content) return;
    const chosen = latest.current.initialFocus?.(dialog);
    if (chosen === false) return;
    if (!chosen && content.contains(content.ownerDocument.activeElement)) return;
    (chosen ?? findInitialFocus(content) ?? dialog).focus({ preventScroll: true });
  }, [open, dialog, content, latest]);

  const captureReturnFocus = useCallback(() => {
    const active = document.activeElement;
    previousRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, []);

  const returnFocus = useCallback(() => {
    const target = resolveReturnTarget(latest.current.returnFocusTo() ?? previousRef.current);
    previousRef.current = null;
    recordFocusHandoff(latest.current.dialog, target);
    if (latest.current.restoreFocus) target?.focus({ preventScroll: true });
  }, [latest]);

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

  return { captureReturnFocus, returnFocus, onKeyDown };
}
