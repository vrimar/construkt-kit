import { type ReactNode, isValidElement, useState } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { Popover, type PopoverRootProps } from "./Popover";

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as { then?: unknown } | null | undefined)?.then === "function";

export interface ActionPopover {
  busy: boolean;
  cancel: () => void;
  run: (task: () => unknown) => void;
}

interface ActionPopoverRootProps extends Omit<PopoverRootProps, "children"> {
  trigger: ReactNode;
  loading: boolean | undefined;
  children: (action: ActionPopover) => ReactNode;
}

export function ActionPopoverRoot({
  trigger,
  loading,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...rest
}: ActionPopoverRootProps) {
  const [resolvedOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: (next) => onOpenChange?.({ open: next }),
  });
  const [pending, setPending] = useState(false);
  const busy = loading === true || pending;

  const action: ActionPopover = {
    busy,
    cancel: () => {
      if (!busy) setOpen(false);
    },
    run: (task) => {
      if (busy) return;
      const result = task();
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

  return (
    <Popover.Root
      {...rest}
      open={resolvedOpen}
      onOpenChange={(details) => {
        if (details.open || !busy) setOpen(details.open);
      }}
    >
      <Popover.Trigger asChild={isValidElement(trigger)}>{trigger}</Popover.Trigger>
      {children(action)}
    </Popover.Root>
  );
}
