import { type ReactNode, isValidElement } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { Button } from "../Buttons";
import { Popover, type PopoverRootProps } from "./Popover";
import { type ActionPopover, useActionPopover } from "./useActionPopover";

export interface ConfirmPopoverProps extends Omit<PopoverRootProps, "children">, PortalledProps {
  /** The trigger: an element becomes the trigger itself, anything else is wrapped in a button. */
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /**
   * Runs on confirm, then the popover closes. Return a promise to keep it open, with the confirm
   * button spinning, until the promise resolves; it stays open if the promise rejects.
   */
  onConfirm: () => unknown;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Paints the confirm button in the `danger` palette. */
  destructive?: boolean;
  /**
   * Spins the confirm button and keeps the popover open: Cancel, Esc and outside clicks do nothing.
   * It doesn't hold the popover open after a confirm; return a promise from `onConfirm` for that.
   */
  loading?: boolean;
}

interface ConfirmContentProps extends PortalledProps {
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => unknown;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  action: ActionPopover;
}

function ConfirmContent({
  ref,
  title,
  description,
  onConfirm,
  confirmLabel,
  cancelLabel,
  destructive,
  action,
  portalled,
  portalRef,
}: WithRef<ConfirmContentProps>) {
  return (
    <Popover.Content
      ref={ref}
      role="alertdialog"
      width="72"
      portalled={portalled}
      portalRef={portalRef}
    >
      <Popover.Header gap="0.5">
        <Popover.Title>{title}</Popover.Title>
        {description && <Popover.Description>{description}</Popover.Description>}
      </Popover.Header>
      <Popover.Footer pt="var(--popover-padding)">
        <Button
          size="sm"
          variant="plain"
          disabled={action.busy}
          onClick={action.cancel}
        >
          {cancelLabel}
        </Button>
        <Button
          size="sm"
          colorPalette={destructive ? "danger" : "brand"}
          loading={action.busy}
          data-autofocus
          onClick={() => action.run(onConfirm)}
        >
          {confirmLabel}
        </Button>
      </Popover.Footer>
    </Popover.Content>
  );
}

export const ConfirmPopover = ({
  ref,
  children,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading,
  open,
  defaultOpen,
  onOpenChange,
  portalled,
  portalRef,
  ...rest
}: WithRef<ConfirmPopoverProps>) => {
  const action = useActionPopover({ open, defaultOpen, onOpenChange }, loading);

  return (
    <Popover.Root
      {...rest}
      {...action.rootProps}
    >
      <Popover.Trigger asChild={isValidElement(children)}>{children}</Popover.Trigger>
      <ConfirmContent
        ref={ref}
        title={title}
        description={description}
        onConfirm={onConfirm}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        destructive={destructive}
        action={action}
        portalled={portalled}
        portalRef={portalRef}
      />
    </Popover.Root>
  );
};
