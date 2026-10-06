import type { ReactNode } from "react";

import { styled } from "#styled-system/jsx";

import { toCssSize } from "../../foundations/cssSize";
import type { Unstyled } from "../../types";
import type { ButtonProps } from "../Buttons";
import { Button } from "../Buttons";
import { Dialog } from "./Dialog";

export interface SubmitDialogFooterParts {
  cancelButton: ReactNode;
  submitButton: ReactNode;
}

export interface SubmitDialogProps {
  title: ReactNode;
  onSubmit?: () => unknown;
  submitLabel?: string;
  submitButtonProps?: Unstyled<ButtonProps>;
  loading?: boolean;
  submitDisabled?: boolean;
  onClose?: () => unknown;
  cancelLabel?: string;
  children: ReactNode;
  open?: boolean;
  /** Max width of the dialog: px if a number, otherwise a size token or CSS length. */
  contentWidth?: string | number;
  autoFocusButton?: boolean;
  /**
   * Lays out the footer from the prebuilt buttons plus any of your own. Keep a `type="submit"`
   * button in it, or Enter in a field has nothing to submit through.
   */
  footer?: (parts: SubmitDialogFooterParts) => ReactNode;
}

export const SubmitDialog = ({
  title,
  children,
  onSubmit,
  submitLabel = "Submit",
  submitButtonProps,
  loading,
  submitDisabled,
  onClose,
  open = true,
  cancelLabel = "Cancel",
  contentWidth,
  autoFocusButton,
  footer,
}: SubmitDialogProps) => {
  const cancelButton = (
    <Button
      variant="plain"
      onClick={onClose}
    >
      {cancelLabel}
    </Button>
  );
  const submitButton = (
    <Button
      type="submit"
      disabled={submitDisabled}
      loading={loading}
      data-autofocus={autoFocusButton || undefined}
      colorPalette="brand"
      {...submitButtonProps}
    >
      {submitLabel}
    </Button>
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose?.();
      }}
      closeOnInteractOutside={false}
      // Stay open when the popover or menu that opened it closes.
      onRequestDismiss={(e) => e.preventDefault()}
    >
      <Dialog.Content
        style={contentWidth == null ? undefined : { maxWidth: toCssSize(contentWidth) }}
      >
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
          {(onSubmit || footer) && (
            <Dialog.Footer gap="2">
              {footer ? (
                footer({ cancelButton, submitButton })
              ) : (
                <>
                  {cancelButton}
                  {submitButton}
                </>
              )}
            </Dialog.Footer>
          )}
        </styled.form>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  );
};
