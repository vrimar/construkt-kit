import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type SyntheticEvent,
  useState,
} from "react";

import type { OpenChangeDetails } from "../../primitives/layer";
import { isRenderable } from "../itemSlots";
import { asRender } from "../renderContent";
import { Popover, type PopoverRootProps, usePopoverContext } from "./Popover";

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as { then?: unknown } | null | undefined)?.then === "function";

export interface ActionPopover {
  busy: boolean;
  cancel: (event?: SyntheticEvent) => void;
  run: (task: () => unknown, event?: SyntheticEvent) => void;
}

/** The props `ConfirmPopover` and `PromptPopover` share. */
export interface ActionPopoverProps extends Omit<PopoverRootProps, "children"> {
  /** Shown on hover over the trigger, and hidden while the popover is open. */
  tooltip?: ReactNode;
  /** Heads the popover. */
  title: ReactNode;
  cancelLabel?: string;
  /**
   * Spins the action button and keeps the popover open: Cancel, Esc and outside clicks do nothing.
   * It doesn't hold the popover open after the action; return a promise from its handler for that.
   */
  loading?: boolean;
}

interface ActionPopoverRootProps extends Omit<PopoverRootProps, "children"> {
  trigger: ReactNode;
  tooltip?: ReactNode;
  loading: boolean | undefined;
  children: (action: ActionPopover) => ReactNode;
}

export function ActionPopoverRoot({
  trigger,
  tooltip,
  loading,
  onOpenChange,
  children,
  ...rest
}: ActionPopoverRootProps) {
  const [pending, setPending] = useState(false);
  const busy = loading === true || pending;

  return (
    <Popover.Root
      {...rest}
      onOpenChange={(next: boolean, details: OpenChangeDetails) => {
        if (!next && busy) details.cancel();
        else onOpenChange?.(next, details);
      }}
    >
      {isRenderable(trigger) && (
        <Popover.Trigger
          {...asRender(trigger)}
          tooltip={tooltip}
        />
      )}
      <ActionPopoverParts
        busy={busy}
        setPending={setPending}
      >
        {children}
      </ActionPopoverParts>
    </Popover.Root>
  );
}

function ActionPopoverParts({
  busy,
  setPending,
  children,
}: {
  busy: boolean;
  setPending: Dispatch<SetStateAction<boolean>>;
  children: (action: ActionPopover) => ReactNode;
}) {
  const { requestOpenChange } = usePopoverContext();
  const close = (event: SyntheticEvent | undefined) =>
    requestOpenChange(false, "close-press", event?.nativeEvent);

  return children({
    busy,
    cancel: (event) => {
      if (!busy) close(event);
    },
    run: (task, event) => {
      if (busy) return;
      const result = task();
      if (!isThenable(result)) {
        close(event);
        return;
      }
      setPending(true);
      result.then(
        () => {
          setPending(false);
          close(event);
        },
        () => setPending(false),
      );
    },
  });
}
