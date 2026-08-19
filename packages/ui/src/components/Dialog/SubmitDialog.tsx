import type { KeyboardEvent, ReactNode } from "react";

import type { ButtonProps } from "../Buttons";
import { Button } from "../Buttons";
import { isPlainEnter } from "../Form/submitOnEnter";
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
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!onSubmit || !isPlainEnter(event)) return;
    onSubmit();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose?.();
      }}
      closeOnEscape
      closeOnInteractOutside={false}
    >
      <Dialog.Content style={{ maxWidth: width }}>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body onKeyDown={handleKeyDown}>{children}</Dialog.Body>
        {onSubmit && (
          <Dialog.Footer gap="2">
            <Button
              variant="plain"
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              disabled={isSubmitDisabled}
              loading={isSubmitLoading}
              onClick={onSubmit}
              autoFocus={autoFocusButton}
              colorPalette="brand"
              {...submitButtonProps}
            >
              {submitLabel}
            </Button>
          </Dialog.Footer>
        )}
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  );
};
