import type { ReactNode } from "react";

import type { Unstyled } from "../../types";
import type { ButtonProps } from "../Buttons";
import { Button } from "../Buttons";

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
  submitButtonProps?: Unstyled<ButtonProps>;
}

export const renderFormActions = ({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Submit",
  loading,
  submitDisabled,
  submitButtonProps,
}: FormActionsOptions): FormActions => ({
  cancelButton: (
    <Button
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
      disabled={submitDisabled}
      loading={loading}
      colorPalette="brand"
      {...submitButtonProps}
    >
      {submitLabel}
    </Button>
  ),
});
