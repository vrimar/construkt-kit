import { HStack, Stack, type StackProps } from "@construkt-kit/styled-system/jsx";
import type { ReactNode } from "react";

import { ApiErrorAlert } from "../Alert";
import { Button } from "../Buttons";

export interface SubmitFormProps extends StackProps {
  children: ReactNode;
  onSubmit: () => unknown;
  isSubmitDisabled?: boolean;
  isSubmitLoading?: boolean;
  error?: unknown;
  onCancel: () => unknown;
}

export const SubmitForm = ({
  children,
  onSubmit,
  isSubmitLoading,
  isSubmitDisabled,
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
          disabled={isSubmitDisabled}
          loading={isSubmitLoading}
          colorPalette="brand"
        >
          Submit
        </Button>
      </HStack>
    </Stack>
  );
};
