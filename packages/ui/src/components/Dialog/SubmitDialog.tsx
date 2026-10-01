import type { ReactNode } from "react";

import { styled } from "#styled-system/jsx";

import type { ButtonProps } from "../Buttons";
import { Button } from "../Buttons";
import { Dialog } from "./Dialog";

export interface SubmitDialogProps {
  title: ReactNode;
  onSubmit?: () => unknown;
  submitLabel?: string;
  submitButtonProps?: ButtonProps;
  isSubmitLoading?: boolean;
  isSubmitDisabled?: boolean;
  onClose?: () => unknown;
  cancelLabel?: string;
  children: ReactNode;
  isOpen?: boolean;
  width?: string;
  autoFocusButton?: boolean;
}

export const SubmitDialog = ({
  title,
  children,
  onSubmit,
  submitLabel = "Submit",
  submitButtonProps,
  isSubmitLoading,
  isSubmitDisabled,
  onClose,
  isOpen = true,
  cancelLabel = "Cancel",
  width,
  autoFocusButton,
}: SubmitDialogProps) => {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose?.();
      }}
      closeOnInteractOutside={false}
      // Stay open when the popover or menu that opened it closes.
      onRequestDismiss={(e) => e.preventDefault()}
    >
      <Dialog.Content style={{ maxWidth: width }}>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <styled.form
          display="contents"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            // Portalled: React still bubbles submit to any form that renders this dialog.
            e.stopPropagation();
            onSubmit?.();
          }}
        >
          <Dialog.Body>{children}</Dialog.Body>
          {onSubmit && (
            <Dialog.Footer gap="2">
              <Button
                variant="plain"
                onClick={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                loading={isSubmitLoading}
                data-autofocus={autoFocusButton || undefined}
                colorPalette="brand"
                {...submitButtonProps}
              >
                {submitLabel}
              </Button>
            </Dialog.Footer>
          )}
        </styled.form>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  );
};
