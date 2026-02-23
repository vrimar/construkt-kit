import React from "react";

import type { ButtonProps } from "../Buttons";
import { Button } from "../Buttons";
import { Dialog } from "./Dialog";

export interface SubmitDialogProps {
  title: React.ReactNode;
  onSubmit?: () => unknown;
  submitLabel?: string;
  submitButtonProps?: ButtonProps;
  isSubmitLoading?: boolean;
  isSubmitDisabled?: boolean;
  onClose?: () => unknown;
  cancelLabel?: string;
  children: React.ReactNode;
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
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      placement="center"
      closeOnEscape
      closeOnInteractOutside={false}
      onEscapeKeyDown={onClose}
    >
      <Dialog.Content maxWidth={width}>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body onKeyDown={handleKeyDown}>{children}</Dialog.Body>
        {onSubmit && (
          <Dialog.Footer gap="2">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              disabled={isSubmitDisabled}
              loading={isSubmitLoading}
              onClick={onSubmit}
              autoFocus={autoFocusButton}
              {...submitButtonProps}
            >
              {submitLabel}
            </Button>
          </Dialog.Footer>
        )}
        <Dialog.CloseTrigger onClick={onClose} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
