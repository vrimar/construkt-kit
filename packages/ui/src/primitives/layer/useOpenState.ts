import { useCallback } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import {
  type OpenChangeDetails,
  type OpenChangeReason,
  createOpenChangeDetails,
} from "./openChange";

export interface UseOpenStateOptions {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
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
      if (next === open) return false;
      const details = createOpenChangeDetails(reason, event);
      onOpenChange?.(next, details);
      if (details.canceled) return false;
      setOpen(next);
      return true;
    },
    [open, onOpenChange, setOpen],
  );

  return { open, requestOpenChange };
}
