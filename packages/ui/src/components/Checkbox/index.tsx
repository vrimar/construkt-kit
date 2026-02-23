import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";
import React from "react";

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  icon?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
}

export function Checkbox({ ref, icon, children, inputProps, rootRef, ...rest }: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <ChakraCheckbox.Root
      ref={rootRef}
      {...rest}
    >
      <ChakraCheckbox.HiddenInput
        ref={ref}
        {...inputProps}
      />
      <ChakraCheckbox.Control cursor="pointer">
        {icon || <ChakraCheckbox.Indicator />}
      </ChakraCheckbox.Control>
      {children != null && <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  );
}
