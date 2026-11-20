import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { visuallyHidden } from "#styled-system/patterns";

import { isSafari } from "../foundations/dom";
import { useControllableState } from "../hooks/useControllableState";
import { useLatestRef } from "../hooks/useLatestRef";
import { type ChangeDetails, createChangeDetails } from "../primitives/change";
import { useFieldControlState, useFormControl } from "../primitives/field";
import { dataAttr } from "../primitives/render";

export type CheckedState = boolean | "indeterminate";

export type CheckedChangeReason = "input-change" | "form-reset";

/** Why `onCheckedChange` was called, and a way to keep the checked state as it is. */
export type CheckedChangeDetails = ChangeDetails<CheckedChangeReason>;

export interface CheckableProps<C extends CheckedState = CheckedState> {
  checked?: C | undefined;
  defaultChecked?: C | undefined;
  onCheckedChange?: ((checked: C, details: CheckedChangeDetails) => void) | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** The name the input submits its `value` under. */
  name?: string | undefined;
  /** What the input submits while checked. @default "on" */
  value?: string | undefined;
  form?: string | undefined;
  /** The input's id. */
  id?: string | undefined;
}

export interface CheckableState {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  focusVisible: boolean;
}

export type CheckableStateAttributes = Record<
  | "data-checked"
  | "data-unchecked"
  | "data-indeterminate"
  | "data-disabled"
  | "data-read-only"
  | "data-invalid"
  | "data-required"
  | "data-focus-visible",
  "" | undefined
>;

type CheckableInputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref: RefObject<HTMLInputElement | null>;
};

export interface Checkable {
  state: CheckableState;
  stateAttributes: CheckableStateAttributes;
  rootProps: { htmlFor: string; onClick: (event: MouseEvent<HTMLElement>) => void };
  inputProps: CheckableInputProps;
}

export interface CheckboxGroupContextValue {
  isChecked: (value: string) => boolean;
  toggle: (value: string, details: CheckedChangeDetails) => void;
  name: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  isAtMax: boolean;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

const hiddenInputClass = visuallyHidden();

/**
 * A checkbox on a visually hidden native `<input type="checkbox">`: checked state, the enclosing
 * `Field` and `Checkbox.Group`, focus-visible, read-only, and form reset.
 */
export function useCheckable(props: CheckableProps, { focusOnPress = false } = {}): Checkable {
  const group = useContext(CheckboxGroupContext);
  const { value = "on" } = props;
  const inGroup = group !== null && props.value !== undefined;
  const {
    checked: checkedProp = inGroup ? group.isChecked(value) : undefined,
    defaultChecked = false,
    onCheckedChange,
    name = inGroup ? group.name : undefined,
    form,
  } = props;
  const field = useFieldControlState({
    id: props.id,
    disabled:
      props.disabled ?? (inGroup ? group.disabled || (group.isAtMax && !checkedProp) : undefined),
    readOnly: props.readOnly ?? (inGroup ? group.readOnly : undefined),
    invalid: props.invalid ?? (inGroup ? group.invalid : undefined),
    required: props.required,
  });
  const generatedId = useId();
  const inputId = field.id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialChecked] = useState(checkedProp ?? defaultChecked);
  const [checkedState, setCheckedState] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
  });
  const [focusVisible, setFocusVisible] = useState(false);

  const indeterminate = checkedState === "indeterminate";
  const checked = checkedState === true;
  const latestRef = useLatestRef({ checked, indeterminate });

  const requestChange = (next: CheckedState, reason: CheckedChangeReason, event?: Event) => {
    const details = createChangeDetails(reason, event);
    onCheckedChange?.(next, details);
    if (details.canceled) return;
    if (inGroup) group.toggle(value, details);
    else setCheckedState(next);
  };

  const syncInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.checked = latestRef.current.checked;
    input.indeterminate = latestRef.current.indeterminate;
  }, [latestRef]);

  const { fieldsetDisabled } = useFormControl(inputRef, () => {
    if (!inGroup && checkedState !== initialChecked) requestChange(initialChecked, "form-reset");
    // The form resets its inputs after the event, which overwrites the restored state.
    requestAnimationFrame(syncInput);
  });

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) input.indeterminate = indeterminate;
  });

  const disabled = field.disabled || fieldsetDisabled;
  const readOnly = field.readOnly;
  const state: CheckableState = {
    checked,
    indeterminate,
    disabled,
    readOnly,
    invalid: field.invalid,
    required: field.required,
    focusVisible: focusVisible && !disabled,
  };

  return {
    state,
    stateAttributes: checkableStateAttributes(state),
    rootProps: {
      htmlFor: inputId,
      onClick(event) {
        if (event.target === inputRef.current) event.stopPropagation();
        if (focusOnPress && !disabled && isSafari()) inputRef.current?.focus();
      },
    },
    inputProps: {
      ref: inputRef,
      id: inputId,
      type: "checkbox",
      className: hiddenInputClass,
      checked,
      disabled,
      required: field.required,
      name,
      value,
      form,
      "aria-labelledby": field.labelId,
      "aria-describedby": field.describedBy,
      "aria-invalid": field.invalid || undefined,
      onClick(event: MouseEvent<HTMLInputElement>) {
        if (readOnly) event.preventDefault();
      },
      onChange(event: ChangeEvent<HTMLInputElement>) {
        if (readOnly) return;
        requestChange(event.currentTarget.checked, "input-change", event.nativeEvent);
        // A controlled checkbox its owner keeps indeterminate loses the state to the click.
        queueMicrotask(syncInput);
      },
      onFocus(event: FocusEvent<HTMLInputElement>) {
        setFocusVisible(event.currentTarget.matches(":focus-visible"));
      },
      onBlur() {
        setFocusVisible(false);
      },
    },
  };
}

export const checkableStateAttributes = (state: CheckableState): CheckableStateAttributes => ({
  "data-checked": dataAttr(state.checked),
  "data-unchecked": dataAttr(!state.checked && !state.indeterminate),
  "data-indeterminate": dataAttr(state.indeterminate),
  "data-disabled": dataAttr(state.disabled),
  "data-read-only": dataAttr(state.readOnly),
  "data-invalid": dataAttr(state.invalid),
  "data-required": dataAttr(state.required),
  "data-focus-visible": dataAttr(state.focusVisible),
});

export const CheckableContext = createContext<Checkable | null>(null);

export function useCheckableContext(part: string): Checkable {
  const context = useContext(CheckableContext);
  if (!context) throw new Error(`${part} must be placed inside its control's Root.`);
  return context;
}
