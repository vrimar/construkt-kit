import { CheckIcon, MinusIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { checkbox } from "#styled-system/recipes";
import type { HTMLStyledProps } from "#styled-system/types";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { createChangeDetails } from "../../primitives/change";
import { useFieldsetContext, useFormControl } from "../../primitives/field";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { HiddenInputControlProps, WithRef } from "../../types";
import {
  type CheckableProps,
  type CheckedChangeDetails,
  type CheckedChangeReason,
  type CheckedState,
  CheckableContext,
  CheckboxGroupContext,
  useCheckable,
  useCheckableContext,
} from "../checkable";

export type { CheckedChangeDetails as CheckboxCheckedChangeDetails };
export type CheckboxCheckedState = CheckedState;

const { withProvider, withContext } = createSlotRecipeContext(checkbox);

const StyledRoot = withProvider(renderable.label, "root");
const StyledControl = withContext(renderable.div, "control");
const StyledGroup = withProvider(renderable.div, "group");
const StyledLabel = withContext(renderable.span, "label");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface CheckboxRootProps
  extends Omit<StyledRootProps, keyof CheckableProps>, CheckableProps {}

function Root({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  value,
  form,
  id,
  ...props
}: CheckboxRootProps) {
  const checkable = useCheckable({
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    value,
    form,
    id,
  });

  return (
    <CheckableContext value={checkable}>
      <StyledRoot
        {...checkable.stateAttributes}
        {...mergeProps<StyledRootProps>(checkable.rootProps, props)}
      />
    </CheckableContext>
  );
}

function Control(props: ComponentProps<typeof StyledControl>) {
  const { stateAttributes } = useCheckableContext("Checkbox.Control");
  return (
    <StyledControl
      aria-hidden
      {...stateAttributes}
      {...props}
    />
  );
}

function Label(props: ComponentProps<typeof StyledLabel>) {
  const { stateAttributes } = useCheckableContext("Checkbox.Label");
  return (
    <StyledLabel
      {...stateAttributes}
      {...props}
    />
  );
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const { inputProps } = useCheckableContext("Checkbox.HiddenInput");
  const composedRef = useComposedRefs(inputProps.ref, ref);
  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(inputProps, props)}
      ref={composedRef}
    />
  );
}

const CheckGlyph = styled(CheckIcon);
const MinusGlyph = styled(MinusIcon);

/** The tick, or a dash while indeterminate; nothing while unchecked. */
const Indicator = ({ ref, ...props }: WithRef<HTMLStyledProps<"svg">, SVGSVGElement>) => {
  const { state, stateAttributes } = useCheckableContext("Checkbox.Indicator");
  if (!state.checked && !state.indeterminate) return null;
  const Glyph = state.indeterminate ? MinusGlyph : CheckGlyph;

  return (
    <Glyph
      ref={ref}
      strokeWidth={3}
      {...stateAttributes}
      {...props}
    />
  );
};

type StyledGroupProps = ComponentProps<typeof StyledGroup>;

export interface CheckboxGroupProps extends Omit<StyledGroupProps, "defaultValue"> {
  /** The `value`s of the checked checkboxes in the group. */
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[], details: CheckedChangeDetails) => void) | undefined;
  /** The name every checkbox in the group submits its `value` under. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  /** Disables the unchecked checkboxes once this many are checked. */
  maxSelectedValues?: number | undefined;
}

const sameValues = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

function Group({
  ref,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  name,
  disabled,
  readOnly = false,
  invalid,
  maxSelectedValues,
  ...props
}: CheckboxGroupProps) {
  const fieldset = useFieldsetContext();
  const groupRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(groupRef, ref);
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const groupDisabled = disabled ?? fieldset?.disabled ?? false;
  const isChecked = (item: string) => value.includes(item);
  const isAtMax = maxSelectedValues != null && value.length >= maxSelectedValues;

  const requestChange = (next: string[], reason: CheckedChangeReason, event?: Event) => {
    const details = createChangeDetails(reason, event);
    onValueChange?.(next, details);
    if (!details.canceled) setValue(next);
  };

  const toggle = (item: string, { reason, event }: CheckedChangeDetails) => {
    if (groupDisabled || readOnly) return;
    if (!isChecked(item) && isAtMax) return;
    requestChange(
      isChecked(item) ? value.filter((entry) => entry !== item) : [...value, item],
      reason,
      event,
    );
  };

  useFormControl(
    groupRef,
    () => {
      if (!sameValues(value, initialValue)) requestChange(initialValue, "form-reset");
    },
    () => groupRef.current?.querySelector("input[type=checkbox]"),
  );

  return (
    <CheckboxGroupContext
      value={{
        isChecked,
        toggle,
        name,
        disabled: groupDisabled,
        readOnly,
        invalid: invalid ?? fieldset?.invalid ?? false,
        isAtMax,
      }}
    >
      <StyledGroup
        role="group"
        {...props}
        ref={composedRef}
      />
    </CheckboxGroupContext>
  );
}

export interface CheckboxProps extends Omit<CheckboxRootProps, "ref">, HiddenInputControlProps {
  /** Drawn inside the box. `null` leaves the tick out but keeps the box. */
  indicator?: ReactNode;
}

function CheckboxSimple({
  ref,
  indicator = <Indicator />,
  children,
  inputProps,
  rootRef,
  ...rest
}: WithRef<CheckboxProps, HTMLInputElement>) {
  return (
    <Root
      ref={rootRef}
      {...rest}
    >
      <HiddenInput
        ref={ref}
        {...inputProps}
      />
      <Control>{indicator}</Control>
      {children != null && <Label>{children}</Label>}
    </Root>
  );
}

export const Checkbox = Object.assign(CheckboxSimple, {
  Root,
  Control,
  Group,
  Label,
  HiddenInput,
  Indicator,
});
