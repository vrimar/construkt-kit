import type { ReactNode } from "react";

import { HStack, Stack, type StackProps } from "#styled-system/jsx";

import { ApiErrorAlert } from "../Alert";
import { Button } from "../Buttons";

export interface SubmitFormProps extends StackProps {
  children: ReactNode;
  onSubmit: () => unknown;
  submitDisabled?: boolean;
  loading?: boolean;
  error?: unknown;
  onCancel: () => unknown;
}

export const SubmitForm = ({
  children,
  onSubmit,
  loading,
  submitDisabled,
  error,
  onCancel,
  ...props
}: SubmitFormProps) => {
  return (
    <Stack
      as="form"
      gap="6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      {...props}
    >
      {error ? <ApiErrorAlert error={error} /> : null}

      <Stack gap="4">{children}</Stack>
      <HStack alignSelf="flex-end">
        <Button
          variant="plain"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          formNoValidate
          disabled={submitDisabled}
          loading={loading}
          colorPalette="brand"
        >
          Submit
        </Button>
      </HStack>
    </Stack>
  );
};
