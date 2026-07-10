import { HStack } from "@construkt-kit/styled-system/jsx";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { WithRef } from "../../types";
import type { ButtonProps } from "../Buttons";
import { Text } from "../Text";
import { Button } from "./Button";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: ReactNode;
  hasValue: boolean;
  label: ReactNode;
}

export const SelectButton = ({
  ref,
  sublabel,
  label,
  hasValue,
  ...props
}: WithRef<SelectButtonProps, HTMLButtonElement>) => {
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
        <ChevronDownIcon />
      </HStack>
    </Button>
  );
};
