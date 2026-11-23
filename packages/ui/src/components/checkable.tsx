import {
  type ChangeEvent,
  type ComponentProps,
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

import { isSafari } from "../foundations/platform";
import { splitOptions } from "../foundations/props";
import { useComposedRefs } from "../hooks/useComposedRefs";
import { useControllableState } from "../hooks/useControllableState";
import { useLatestRef } from "../hooks/useLatestRef";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../primitives/change";
import { hiddenInputClass, useFormFieldState } from "../primitives/field";
import {
  type CheckedState,
  checkedStateAttributes,
  dataAttr,
  fieldStateAttributes,
  mergeProps,
  renderable,
} from "../primitives/render";
import { createPartContext } from "./partContext";

export type { CheckedState };

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

const CHECKABLE_KEYS = {
  checked: true,
  defaultChecked: true,
  onCheckedChange: true,
  disabled: true,
  readOnly: true,
  invalid: true,
  required: true,
  name: true,
  value: true,
  form: true,
  id: true,
} as const satisfies Record<keyof CheckableProps, true>;

/** Splits a checkable root's `CheckableProps` off the props its element gets. */
export const splitCheckableProps = <P extends Partial<Record<keyof CheckableProps, unknown>>>(
  props: P,
) => splitOptions(props, CHECKABLE_KEYS);

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
  rootProps: { htmlFor: string | undefined; onClick: (event: MouseEvent<HTMLElement>) => void };
  inputProps: CheckableInputProps;
  reportRendered: ReportRendered<"input">;
}

export interface CheckboxGroupContextValue {
  isChecked: (value: string) => boolean;
  toggle: (value: string, reason: CheckedChangeReason, event: Event | undefined) => void;
  name: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  /** The group is required and nothing in it is checked, so each member is required. */
  required: boolean;
  isAtMax: boolean;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

/**
 * A checkbox on a visually hidden native `<input type="checkbox">`: checked state, the enclosing
 * `Field` and `Checkbox.Group`, focus-visible, read-only, and form reset.
 */
export function useCheckable(props: CheckableProps): Checkable {
  const group = useContext(CheckboxGroupContext);
  const { value = "on" } = props;
  const inGroup = group !== null && props.value !== undefined;
  const ownsField = group === null;
  const {
    checked: checkedProp = inGroup ? group.isChecked(value) : undefined,
    defaultChecked = false,
    onCheckedChange,
    name = inGroup ? group.name : undefined,
    form,
  } = props;
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rendered, reportRendered] = useRenderedParts<"input">();
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
    if (!emitChange(onCheckedChange, next, reason, event)) return;
    if (inGroup) group.toggle(value, reason, event);
    else setCheckedState(next);
  };

  const syncInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.checked = latestRef.current.checked;
    input.indeterminate = latestRef.current.indeterminate;
  }, [latestRef]);

  const field = useFormFieldState(
    {
      id: ownsField ? props.id : undefined,
      disabled:
        props.disabled ?? (inGroup ? group.disabled || (group.isAtMax && !checkedProp) : undefined),
      readOnly: props.readOnly ?? (inGroup ? group.readOnly : undefined),
      invalid: props.invalid ?? (inGroup ? group.invalid : undefined),
      required: props.required ?? (ownsField ? undefined : inGroup && group.required),
    },
    {
      elementRef: inputRef,
      onReset() {
        if (!inGroup && checkedState !== initialChecked)
          requestChange(initialChecked, "form-reset");
      },
      afterReset: syncInput,
    },
  );
  const inputId = (ownsField ? field.id : props.id) ?? generatedId;

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) input.indeterminate = indeterminate;
  });

  const { disabled, readOnly } = field;
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
    reportRendered,
    rootProps: {
      htmlFor: rendered.input,
      onClick(event) {
        if (event.target === inputRef.current) event.stopPropagation();
        if (!disabled && isSafari()) inputRef.current?.focus();
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
      "aria-labelledby": ownsField ? field.labelId : undefined,
      "aria-describedby": ownsField ? field.describedBy : undefined,
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
  ...checkedStateAttributes(state.indeterminate ? "indeterminate" : state.checked),
  ...fieldStateAttributes(state),
  "data-focus-visible": dataAttr(state.focusVisible),
});

export const [CheckableContext, useCheckableContext] =
  createPartContext<Checkable>("its control's Root");

type HiddenInputProps = ComponentProps<typeof renderable.input>;

/** The native checkbox of the checkable its `Root` provides, with `props` merged over its own. */
export function CheckableHiddenInput({ ref, ...props }: HiddenInputProps) {
  const { inputProps, reportRendered } = useCheckableContext("Checkbox.HiddenInput");
  const composedRef = useComposedRefs(inputProps.ref, ref);
  const id = useReportRendered(reportRendered, "input", props.id ?? inputProps.id);
  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(inputProps, props, { id })}
      ref={composedRef}
    />
  );
}
