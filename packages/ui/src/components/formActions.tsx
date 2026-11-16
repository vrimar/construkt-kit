import type { ReactNode, SyntheticEvent } from "react";

import type { Unstyled } from "../types";
import { Button, type ButtonProps } from "./Buttons";

export interface FormActions {
  cancelButton: ReactNode;
  submitButton: ReactNode;
}

export interface FormActionsOptions {
  onCancel?: () => unknown;
  cancelLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  size?: ButtonProps["size"];
  submitButtonProps?: Unstyled<ButtonProps>;
}

export const renderFormActions = ({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Submit",
  loading,
  submitDisabled,
  size,
  submitButtonProps,
}: FormActionsOptions): FormActions => ({
  cancelButton: (
    <Button
      size={size}
      variant="plain"
      disabled={loading}
      onClick={onCancel}
    >
      {cancelLabel}
    </Button>
  ),
  submitButton: (
    <Button
      type="submit"
      size={size}
      disabled={submitDisabled}
      loading={loading}
      colorPalette="brand"
      {...submitButtonProps}
    >
      {submitLabel}
    </Button>
  ),
});

export const formSubmitProps = (onSubmit: (() => unknown) | undefined) => ({
  noValidate: true,
  onSubmit: (event: SyntheticEvent) => {
    event.preventDefault();
    // React bubbles submit out of a portal to any form that renders this one.
    event.stopPropagation();
    onSubmit?.();
  },
});
