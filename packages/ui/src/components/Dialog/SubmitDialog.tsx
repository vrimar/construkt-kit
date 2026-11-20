import type { CSSProperties, ReactNode } from "react";

import { styled } from "#styled-system/jsx";

import { toCssSize } from "../../foundations/cssSize";
import type { Unstyled } from "../../types";
import type { ButtonProps } from "../Buttons";
import { type FormActions, formSubmitProps, renderFormActions } from "../formActions";
import { Dialog, type DialogRootProps } from "./Dialog";

export type SubmitDialogFooterParts = FormActions;

export interface SubmitDialogProps {
  title: Exclude<ReactNode, null | undefined | boolean>;
  onSubmit?: () => unknown;
  submitLabel?: string;
  submitButtonProps?: Unstyled<ButtonProps>;
  /** Spins the submit button and keeps the dialog open: Cancel, the close button and Esc do nothing. */
  loading?: boolean;
  submitDisabled?: boolean;
  onClose?: () => unknown;
  cancelLabel?: string;
  children: ReactNode;
  open?: boolean;
  /** Max width of the dialog from `md` up: px if a number, otherwise a size token or CSS length. */
  contentWidth?: string | number;
  /** `xs` and `sm` stay centred on phones; larger sizes fill the screen below `md`. @default "md" */
  size?: DialogRootProps["size"];
  autoFocusButton?: boolean;
  /**
   * Lays out the footer from the prebuilt buttons plus any of your own. Keep a `type="submit"`
   * button in it, or Enter in a field has nothing to submit through.
   */
  footer?: (parts: SubmitDialogFooterParts) => ReactNode;
}

const contentWidthStyle = (
  contentWidth: string | number,
): CSSProperties & { "--submit-dialog-max-w": string } => ({
  "--submit-dialog-max-w": toCssSize(contentWidth),
});

export const SubmitDialog = ({
  title,
  children,
  onSubmit,
  submitLabel,
  submitButtonProps,
  loading,
  submitDisabled,
  onClose,
  open = true,
  cancelLabel,
  contentWidth,
  size,
  autoFocusButton,
  footer,
}: SubmitDialogProps) => {
  const { cancelButton, submitButton } = renderFormActions({
    onCancel: onClose,
    cancelLabel,
    submitLabel,
    loading,
    submitDisabled,
    submitButtonProps: { "data-autofocus": autoFocusButton || undefined, ...submitButtonProps },
  });

  return (
    <Dialog.Root
      title={title}
      open={open}
      size={size}
      onOpenChange={(next, details) => {
        if (next) return;
        if (loading) details.cancel();
        else onClose?.();
      }}
      closeOnInteractOutside={false}
    >
      <Dialog.Content
        maxW={contentWidth == null ? undefined : { md: "var(--submit-dialog-max-w)" }}
        style={contentWidth == null ? undefined : contentWidthStyle(contentWidth)}
      >
        <styled.form
          display="contents"
          {...formSubmitProps(onSubmit)}
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
        <Dialog.CloseTrigger disabled={loading} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
