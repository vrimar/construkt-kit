import { Field as ArkField } from "@ark-ui/react/field";
import type { ComponentProps, ReactNode } from "react";
import { createStyleContext } from "styled-system/jsx";
import { field } from "styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(field);

const Root = withProvider(ArkField.Root, "root");
const Label = withContext(ArkField.Label, "label");
const HelperText = withContext(ArkField.HelperText, "helperText");
const ErrorText = withContext(ArkField.ErrorText, "errorText");
const RequiredIndicator = withContext(ArkField.RequiredIndicator, "requiredIndicator");

export interface FieldProps extends Omit<ComponentProps<typeof Root>, "label"> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  optionalText?: ReactNode;
}

export const Field = ({
  ref,
  label,
  children,
  helperText,
  errorText,
  optionalText,
  ...rest
}: WithRef<FieldProps>) => {
  return (
    <Root
      ref={ref}
      {...rest}
    >
      {label && (
        <Label>
          {label}
          <RequiredIndicator fallback={optionalText} />
        </Label>
      )}
      {children}
      {helperText && <HelperText>{helperText}</HelperText>}
      {errorText && <ErrorText>{errorText}</ErrorText>}
    </Root>
  );
};
