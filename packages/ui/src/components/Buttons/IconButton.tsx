import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { Icon, IconButton as ChakraIconButton, Spinner } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";

export interface IconButtonProps extends ChakraButtonProps {
  icon: ReactNode;
  loading?: boolean;
}

export function IconButton({ ref, icon, loading, ...props }: IconButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ChakraIconButton
      variant="ghost"
      ref={ref}
      {...props}
    >
      {loading ? <Spinner size={props.size as any} /> : <Icon size="inherit">{icon}</Icon>}
    </ChakraIconButton>
  );
}
