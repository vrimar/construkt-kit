import type { ReactNode } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { renderFormActions } from "../formActions";
import { isRenderable } from "../itemSlots";
import { ActionPopoverRoot } from "./ActionPopoverRoot";
import { Popover, type PopoverRootProps } from "./Popover";

export interface ConfirmPopoverProps extends Omit<PopoverRootProps, "children">, PortalledProps {
  /** The trigger: an element becomes the trigger itself, anything else is wrapped in a button. */
  children: ReactNode;
  /** Shown on hover over the trigger, and hidden while the popover is open. */
  tooltip?: ReactNode;
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
  portalled,
  portalRef,
  ...rest
}: WithRef<ConfirmPopoverProps>) => (
  <ActionPopoverRoot
    {...rest}
    trigger={children}
    loading={loading}
  >
    {(action) => {
      const { cancelButton, submitButton } = renderFormActions({
        size: "sm",
        onCancel: action.cancel,
        cancelLabel,
        submitLabel: confirmLabel,
        loading: action.busy,
        submitButtonProps: {
          type: "button",
          colorPalette: destructive ? "danger" : "brand",
          "data-autofocus": true,
          onClick: () => action.run(onConfirm),
        },
      });

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
            {isRenderable(description) && <Popover.Description>{description}</Popover.Description>}
          </Popover.Header>
          <Popover.Footer pt="var(--popover-padding)">
            {cancelButton}
            {submitButton}
          </Popover.Footer>
        </Popover.Content>
      );
    }}
  </ActionPopoverRoot>
);
