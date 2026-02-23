import type { InputProps } from "@chakra-ui/react";
import { Button, HStack, Input, Stack } from "@chakra-ui/react";
import React, { useState } from "react";

import { Popover } from "../Popover";

export interface ApplyInputProps {
  value: string;
  inputProps?: InputProps;
  onApply: (value: string) => unknown;
  children: React.ReactNode;
}

export const ApplyInput = ({ value, onApply, children, inputProps }: ApplyInputProps) => {
  const [tempValue, setTempValue] = useState(value);
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (visibility: boolean) => {
    setOpen(visibility);
    setTempValue(value);
  };

  const handleChange = (newValue: string) => {
    setTempValue(newValue);
  };

  const handleReset = () => {
    setTempValue("");
    onApply("");
    setOpen(false);
  };

  const handleApply = () => {
    onApply(tempValue);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open }) => handleOpenChange(open)}
    >
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content
        width="200px"
        p="2"
      >
        <Stack>
          <Input
            autoFocus
            variant="subtle"
            placeholder="Search..."
            {...inputProps}
            value={tempValue}
            onChange={(e) => handleChange(e.target.value)}
            size="sm"
          />
          <HStack
            justifyContent="flex-end"
            p="2"
          >
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
            >
              Reset
            </Button>
            <Button
              onClick={handleApply}
              size="sm"
            >
              Apply
            </Button>
          </HStack>
        </Stack>
      </Popover.Content>
    </Popover.Root>
  );
};
