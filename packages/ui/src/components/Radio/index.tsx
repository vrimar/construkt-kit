import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react";
import React from "react";

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  rootRef?: React.Ref<HTMLDivElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function Radio({ ref, children, inputProps, rootRef, ...rest }: RadioProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <ChakraRadioGroup.Item
      ref={rootRef}
      cursor="pointer"
      {...rest}
    >
      <ChakraRadioGroup.ItemHiddenInput
        ref={ref}
        {...inputProps}
      />
      <ChakraRadioGroup.ItemIndicator />
      {children && <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>}
    </ChakraRadioGroup.Item>
  );
}

export const RadioGroup = ChakraRadioGroup.Root;
