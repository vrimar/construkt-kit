import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type FieldVariantProps, field as fieldRecipe } from "#styled-system/recipes";

import {
  type FieldContextValue,
  FieldContext,
  useFieldContext,
  useFieldLabelId,
  useFieldMessageProps,
  useFieldRoot,
} from "../../primitives/field";
import { dataAttr, fieldStateAttributes, mergeProps, renderable } from "../../primitives/render";

const { withProvider, withContext } = createSlotRecipeContext(fieldRecipe);

const Root = withProvider(renderable.div, "root");
const StyledLabel = withContext(renderable.label, "label");
const StyledHelperText = withContext(renderable.span, "helperText");
const StyledErrorText = withContext(renderable.span, "errorText");
const StyledRequiredIndicator = withContext(renderable.span, "requiredIndicator");
const LabelAction = withContext(renderable.div, "labelAction");

function useField(): FieldContextValue {
  const field = useFieldContext();
  if (!field) throw new Error("A Field part must be placed inside <Field>.");
  return field;
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label({ id, ...props }: LabelProps) {
  const field = useField();
  const labelId = useFieldLabelId(id);
  const { focusControl } = field;
  return (
    <StyledLabel
      {...mergeProps<LabelProps>(
        {
          id: labelId,
          htmlFor: field.ids.control,
          ...fieldStateAttributes(field),
          onClick(event: MouseEvent<HTMLLabelElement>) {
            if (event.defaultPrevented || event.currentTarget.control) return;
            focusControl?.();
          },
        },
        props,
      )}
    />
  );
}

function HelperText(props: ComponentProps<typeof StyledHelperText>) {
  const field = useField();
  return (
    <StyledHelperText
      {...useFieldMessageProps(field, "helperText")}
      data-disabled={dataAttr(field.disabled)}
      {...props}
    />
  );
}

function ErrorText(props: ComponentProps<typeof StyledErrorText>) {
  return (
    <StyledErrorText
      {...useFieldMessageProps(useField(), "errorText")}
      {...props}
    />
  );
}

function RequiredIndicator({ fallback }: { fallback?: ReactNode }) {
  const field = useField();
  if (!field.required) return fallback;
  return <StyledRequiredIndicator aria-hidden>*</StyledRequiredIndicator>;
}

type RootProps = ComponentProps<typeof Root>;

export interface FieldProps extends RootProps {
  /** The control's id, which the label points at; a control that sets its own replaces it. */
  id?: string | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
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
  /** Shown while `invalid`. */
  errorText?: ReactNode;
  optionalText?: ReactNode;
}

export const Field = ({
  ref,
  id,
  disabled,
  invalid,
  readOnly,
  required,
  label,
  labelAction,
  children,
  helperText,
  errorText,
  optionalText,
  ...rest
}: FieldProps) => {
  const field = useFieldRoot({ id, disabled, invalid, readOnly, required });
  const { ids } = field;

  return (
    <FieldContext value={field}>
      <Root
        ref={ref}
        id={ids.root}
        {...fieldStateAttributes({
          disabled: field.disabled,
          invalid: field.invalid,
          readOnly: field.readOnly,
        })}
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
        {errorText && field.invalid && <ErrorText>{errorText}</ErrorText>}
        {labelAction && <LabelAction>{labelAction}</LabelAction>}
      </Root>
    </FieldContext>
  );
};
