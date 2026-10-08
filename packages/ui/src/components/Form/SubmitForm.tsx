import type { ReactNode } from "react";

import { HStack, Stack, type StackProps } from "#styled-system/jsx";

import { ApiErrorAlert } from "../Alert";
import { renderFormActions } from "./FormActions";

export interface SubmitFormProps extends StackProps {
  children: ReactNode;
  onSubmit: () => unknown;
  submitLabel?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  error?: unknown;
  onCancel: () => unknown;
  cancelLabel?: string;
}

export const SubmitForm = ({
  children,
  onSubmit,
  submitLabel,
  loading,
  submitDisabled,
  error,
  onCancel,
  cancelLabel,
  ...props
}: SubmitFormProps) => {
  const { cancelButton, submitButton } = renderFormActions({
    onCancel,
    cancelLabel,
    submitLabel,
    loading,
    submitDisabled,
  });

  return (
    <Stack
      as="form"
      gap="6"
      {...{ noValidate: true }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      {...props}
    >
      {error ? <ApiErrorAlert error={error} /> : null}

      <Stack gap="4">{children}</Stack>
      <HStack alignSelf="flex-end">
        {cancelButton}
        {submitButton}
      </HStack>
    </Stack>
  );
};
