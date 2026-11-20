import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type SyntheticEvent,
  useState,
} from "react";

import { type OpenChangeDetails, useOpenState } from "../../primitives/layer";
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
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...rest
}: ActionPopoverRootProps) {
  const { open: resolvedOpen, requestOpenChange } = useOpenState({
    open,
    defaultOpen,
    onOpenChange,
  });
  const [pending, setPending] = useState(false);
  const busy = loading === true || pending;

  return (
    <Popover.Root
      {...rest}
      open={resolvedOpen}
      onOpenChange={(next: boolean, details: OpenChangeDetails) => {
        if ((!next && busy) || !requestOpenChange(next, details.reason, details.event)) {
          details.cancel();
        }
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
