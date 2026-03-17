import { ChevronDownIcon, XIcon } from "lucide-react";
import React from "react";
import { Box, HStack } from "styled-system/jsx";
import type { WithRef } from "../../types";

import type { ButtonProps } from ".";
import { Button } from ".";
import { Text } from "../Text";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: React.ReactNode;
  hasValue: boolean;
  label: React.ReactNode;
  onClear?: () => unknown;
}

export const SelectButton = ({
  ref,
  sublabel,
  label,
  hasValue,
  onClear,
  ...props
}: WithRef<SelectButtonProps, HTMLButtonElement>) => {
  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <Button
      ref={ref}
      variant="surface"
      colorPalette="neutral"
      justifyContent="space-between"
      {...props}
    >
      <HStack width="100%">
        {sublabel && <Text color="fg.muted">{sublabel}</Text>}
        <Text
          truncate
          flex="1"
          textAlign="left"
          color={hasValue ? undefined : "fg.subtle"}
        >
          {label}
        </Text>
        <HStack gap="0">
          {hasValue && onClear ? (
            <Box onClick={handleClear}>
              <XIcon />
            </Box>
          ) : (
            <ChevronDownIcon />
          )}
        </HStack>
      </HStack>
    </Button>
  );
};
