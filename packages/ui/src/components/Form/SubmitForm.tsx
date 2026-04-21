import type { KeyboardEvent, ReactNode } from "react";

import { ApiErrorAlert } from "../Alert";
import { Button } from "../Buttons";
import type { StackProps } from "../Layout";
import { HStack, Stack } from "../Layout";

interface SubmitFormProps extends StackProps {
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
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (event.key === "Enter" && target.tagName !== "TEXTAREA" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <Stack
      as="form"
      gap="6"
      onKeyDown={handleKeyDown}
      onSubmit={(e) => e.preventDefault()}
      {...props}
    >
      {error ? <ApiErrorAlert error={error} /> : null}

      <Stack gap="4">{children}</Stack>
      <HStack alignSelf="flex-end">
        <Button
          variant="plain"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
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
