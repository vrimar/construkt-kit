import { sameItems } from "@construkt-kit/utils";
import { CheckIcon, MinusIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { checkbox } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { emitChange } from "../../primitives/change";
import {
  useFieldFocusControl,
  useFieldsetContext,
  useFormFieldState,
} from "../../primitives/field";
import { mergeProps, renderable } from "../../primitives/render";
import type { HiddenInputControlProps, WithRef } from "../../types";
import {
  type CheckableProps,
  type CheckedChangeDetails,
  type CheckedChangeReason,
  type CheckedState,
  CheckableContext,
  CheckableHiddenInput,
  CheckboxGroupContext,
  splitCheckableProps,
  useCheckable,
  useCheckableContext,
} from "../checkable";
import { toggleMember } from "../toggleMember";

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

function Root(rootProps: CheckboxRootProps) {
  const [checkableProps, props] = splitCheckableProps(rootProps);
  const checkable = useCheckable(checkableProps);

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

const StyledIndicator = styled(renderable.svg);

/** The tick, or a dash while indeterminate; nothing while unchecked. */
const Indicator = ({ render, ...props }: ComponentProps<typeof StyledIndicator>) => {
  const { state, stateAttributes } = useCheckableContext("Checkbox.Indicator");
  if (!state.checked && !state.indeterminate) return null;
  const Glyph = state.indeterminate ? MinusIcon : CheckIcon;

  return (
    <StyledIndicator
      strokeWidth={3}
      {...stateAttributes}
      {...props}
      render={render ?? <Glyph />}
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

function Group({
  ref,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  name,
  disabled,
  readOnly,
  invalid,
  maxSelectedValues,
  ...props
}: CheckboxGroupProps) {
  const fieldset = useFieldsetContext();
  const groupRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(groupRef, ref);
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const isChecked = (item: string) => value.includes(item);
  const isAtMax = maxSelectedValues != null && value.length >= maxSelectedValues;

  const requestChange = (next: string[], reason: CheckedChangeReason, event?: Event) => {
    if (emitChange(onValueChange, next, reason, event)) setValue(next);
  };

  const field = useFormFieldState(
    { disabled, readOnly, invalid: invalid ?? (fieldset?.invalid || undefined) },
    {
      elementRef: groupRef,
      onReset() {
        if (!sameItems(value, initialValue)) requestChange(initialValue, "form-reset");
      },
      input: () => groupRef.current?.querySelector("input[type=checkbox]"),
    },
  );

  const toggle = (item: string, reason: CheckedChangeReason, event: Event | undefined) => {
    if (field.disabled || field.readOnly) return;
    if (!isChecked(item) && isAtMax) return;
    requestChange(toggleMember(value, item, { multiple: true }), reason, event);
  };

  useFieldFocusControl(() =>
    groupRef.current
      ?.querySelector<HTMLInputElement>("input[type=checkbox]:not(:disabled)")
      ?.focus(),
  );

  return (
    <CheckboxGroupContext
      value={{
        isChecked,
        toggle,
        name,
        disabled: field.disabled,
        readOnly: field.readOnly,
        invalid: field.invalid,
        required: field.required && value.length === 0,
        isAtMax,
      }}
    >
      <StyledGroup
        role="group"
        aria-labelledby={field.labelId}
        aria-describedby={field.describedBy}
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
      <CheckableHiddenInput
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
  HiddenInput: CheckableHiddenInput,
  Indicator,
});
