import { Field as ChakraField } from "@chakra-ui/react";
import React from "react";

export interface FieldProps extends Omit<ChakraField.RootProps, "label"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
}

export function Field({
  ref,
  label,
  children,
  helperText,
  errorText,
  optionalText,
  ...rest
}: FieldProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraField.Root
      ref={ref}
      {...rest}
    >
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
}
