import { type ReactNode, useCallback } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { emitChange } from "../change";
import type { OpenChangeDetails, OpenChangeReason } from "./openChange";

export interface UseOpenStateOptions {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}

/** The open state, dismissal and focus props a modal's or a popover's root takes. */
export interface OverlayRootProps extends UseOpenStateOptions {
  children?: ReactNode;
  /** The element to focus when it opens, in place of its first focusable one. */
  initialFocusEl?: (() => HTMLElement | null) | undefined;
  /** The element focus returns to in place of the trigger. */
  returnFocusTo?: (() => HTMLElement | null) | undefined;
  /** @default true */
  closeOnEscape?: boolean | undefined;
}

export interface OpenState {
  open: boolean;
  /** Asks to open or close for `reason`; returns whether it did. */
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
}

/** An overlay's open state, which `onOpenChange` hears of first and can keep with `details.cancel()`. */
export function useOpenState({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: UseOpenStateOptions): OpenState {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen });

  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      if (next === open || !emitChange(onOpenChange, next, reason, event)) return false;
      setOpen(next);
      return true;
    },
    [open, onOpenChange, setOpen],
  );

  return { open, requestOpenChange };
}
