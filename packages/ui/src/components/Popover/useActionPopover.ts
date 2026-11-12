import type { PopoverOpenChangeDetails } from "@ark-ui/react/popover";
import { useState } from "react";

import type { PopoverRootProps } from "./Popover";

type OpenProps = Pick<PopoverRootProps, "open" | "defaultOpen" | "onOpenChange">;

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as { then?: unknown } | null | undefined)?.then === "function";

export interface ActionPopover {
  busy: boolean;
  rootProps: {
    open: boolean;
    onOpenChange: (details: PopoverOpenChangeDetails) => void;
  };
  cancel: () => void;
  run: (action: () => unknown) => void;
}

export function useActionPopover(
  { open, defaultOpen = false, onOpenChange }: OpenProps,
  loading: boolean | undefined,
): ActionPopover {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const busy = loading === true || pending;

  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.({ open: next });
  };

  return {
    busy,
    rootProps: {
      open: open ?? uncontrolledOpen,
      onOpenChange: (details) => {
        if (details.open || !busy) setOpen(details.open);
      },
    },
    cancel: () => {
      if (!busy) setOpen(false);
    },
    run: (action) => {
      if (busy) return;
      const result = action();
      if (!isThenable(result)) {
        setOpen(false);
        return;
      }
      setPending(true);
      result.then(
        () => {
          setPending(false);
          setOpen(false);
        },
        () => setPending(false),
      );
    },
  };
}
