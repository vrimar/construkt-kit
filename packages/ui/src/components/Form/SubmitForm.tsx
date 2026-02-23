import type { StackProps } from "../Layout";
import { HStack, Stack } from "../Layout";
import { Button } from "../Buttons";
import { ApiErrorAlert } from "../Alert";
import React from "react";

interface Props extends StackProps {
  children: React.ReactNode;
  onSubmit: () => unknown;
  isSubmitDisabled?: boolean;
  isSubmitLoading?: boolean;
  error?: any;
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
}: Props) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && onSubmit) {
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
      {error && <ApiErrorAlert error={error} />}

      <Stack gap="4">{children}</Stack>
      <HStack alignSelf="flex-end">
        <Button
          variant="ghost"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          loading={isSubmitLoading}
        >
          Submit
        </Button>
      </HStack>
    </Stack>
  );
};
