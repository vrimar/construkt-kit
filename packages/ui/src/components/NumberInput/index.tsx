import { NumberInput as ChakraNumberInput } from "@chakra-ui/react";
import React from "react";

export type NumberInputProps = ChakraNumberInput.RootProps;

function NumberInputRoot({ ref, children, ...rest }: NumberInputProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraNumberInput.Root
      ref={ref}
      variant="outline"
      {...rest}
    >
      {children}
      {/* <ChakraNumberInput.Control>
        <ChakraNumberInput.IncrementTrigger />
        <ChakraNumberInput.DecrementTrigger />
      </ChakraNumberInput.Control> */}
    </ChakraNumberInput.Root>
  );
}

export const NumberInput = Object.assign(NumberInputRoot, {
  Root: NumberInputRoot,
  Field: ChakraNumberInput.Input,
  Scrubber: ChakraNumberInput.Scrubber,
  Label: ChakraNumberInput.Label,
});
