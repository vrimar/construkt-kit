import { ChevronDownIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Box, HStack } from "styled-system/jsx";

import type { WithRef } from "../../types";
import type { ButtonProps } from "../Buttons";
import { Text } from "../Text";
import { Button } from "./Button";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: ReactNode;
  hasValue: boolean;
  label: ReactNode;
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
            <Box
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
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
