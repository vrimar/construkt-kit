import { Field as ArkField } from "@ark-ui/react/field";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type FieldVariantProps, field } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(field);

const Root = withProvider(ArkField.Root, "root");
const Label = withContext(ArkField.Label, "label");
const HelperText = withContext(ArkField.HelperText, "helperText");
const ErrorText = withContext(ArkField.ErrorText, "errorText");
const RequiredIndicator = withContext(ArkField.RequiredIndicator, "requiredIndicator");
const LabelAction = withContext("div", "labelAction");

export interface FieldProps extends Omit<ComponentProps<typeof Root>, "label"> {
  label?: ReactNode;
  /**
   * `horizontal` puts the label in a column beside the control from `md` up and stacks below it.
   * `--field-label-width` sets that column's width. @default "vertical"
   */
  orientation?: FieldVariantProps["orientation"];
  /**
   * Shown at the end of the label row but placed after the control, so it follows the control in tab order.
   * In `horizontal` orientation it trails the control.
   */
  labelAction?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  optionalText?: ReactNode;
}

export const Field = ({
  ref,
  label,
  labelAction,
  children,
  helperText,
  errorText,
  optionalText,
  ...rest
}: FieldProps) => {
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
      {labelAction && (
        <LabelAction
          data-scope="field"
          data-part="label-action"
        >
          {labelAction}
        </LabelAction>
      )}
    </Root>
  );
};
