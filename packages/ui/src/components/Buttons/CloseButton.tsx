import type { ButtonProps as ChakraCloseButtonProps } from "@chakra-ui/react";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import React from "react";
import { LuX } from "react-icons/lu";

export interface CloseButtonProps extends ChakraCloseButtonProps {}

export function CloseButton({ ref, children, ...props }: CloseButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ChakraIconButton
      variant="ghost"
      aria-label="Close"
      ref={ref}
      {...props}
    >
      {children ?? <LuX />}
    </ChakraIconButton>
  );
}
