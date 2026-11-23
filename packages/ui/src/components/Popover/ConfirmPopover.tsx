import type { ReactNode } from "react";

import type { Anchor } from "../../primitives/position";
import type { WithRef } from "../../types";
import { renderFormActions } from "../formActions";
import { isRenderable } from "../itemSlots";
import { ActionPopoverRoot, type ActionPopoverProps } from "./ActionPopoverRoot";
import { Popover } from "./Popover";

type ConfirmPopoverTriggerProps =
  | {
      /** The trigger: an element becomes the trigger itself, anything else is wrapped in a button. */
      children: ReactNode;
    }
  | { children?: undefined; anchor: Anchor };

export type ConfirmPopoverProps = ConfirmPopoverOwnProps & ConfirmPopoverTriggerProps;

interface ConfirmPopoverOwnProps extends ActionPopoverProps {
  description?: ReactNode;
  /**
   * Runs on confirm, then the popover closes. Return a promise to keep it open, with the confirm
   * button spinning, until the promise resolves; it stays open if the promise rejects.
   */
  onConfirm: () => unknown;
  confirmLabel?: string;
  /** Paints the confirm button in the `danger` palette and opens with focus on Cancel instead of it. */
  destructive?: boolean;
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
        destructive,
        submitButtonProps: {
          type: "button",
          "data-autofocus": destructive ? undefined : true,
          onClick: (event) => action.run(onConfirm, event),
        },
      });

      return (
        <Popover.Content
          ref={ref}
          role="alertdialog"
          width="72"
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
