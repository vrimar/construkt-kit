import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import { FiChevronDown, FiX } from "react-icons/fi";

import { Text, TruncatedText } from "../Text";
import type { ButtonProps } from ".";
import { Button } from ".";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: React.ReactNode;
  hasValue: boolean;
  label: React.ReactNode;
  onClear?: () => unknown;
}

export function SelectButton({
  ref,
  sublabel,
  label,
  hasValue,
  onClear,
  ...props
}: SelectButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <Button
      ref={ref}
      variant="outline"
      justifyContent="space-between"
      {...props}
    >
      <HStack width="100%">
        {sublabel && <Text color="fg.muted">{sublabel}</Text>}
        <TruncatedText
          flex="1"
          textAlign="left"
          color={hasValue ? undefined : "fg.subtle"}
        >
          {label}
        </TruncatedText>
        <HStack gap="0">
          {hasValue && onClear ? (
            <Box onClick={handleClear}>
              <FiX />
            </Box>
          ) : (
            <FiChevronDown />
          )}
        </HStack>
      </HStack>
    </Button>
  );
}
