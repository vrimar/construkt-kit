import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
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
import { useFieldsetContext, useFormControl } from "../primitives/field";
import { dataAttr } from "../primitives/render";

export type RadioValueChangeReason = "input-change" | "form-reset";

/** Why `onValueChange` was called, and a way to keep the value as it is. */
export type RadioValueChangeDetails = ChangeDetails<RadioValueChangeReason>;

export type RadioGroupOrientation = "horizontal" | "vertical";

export interface RadioGroupRootOptions {
  /** The checked item's `value`, or `null` for none. */
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onValueChange?: ((value: string | null, details: RadioValueChangeDetails) => void) | undefined;
  /** The name the checked item submits its `value` under. */
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** @default "vertical" */
  orientation?: RadioGroupOrientation | undefined;
  id?: string | undefined;
}

interface RadioGroupContextValue {
  value: string | null;
  select: (value: string, event: Event) => void;
  name: string;
  form: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  orientation: RadioGroupOrientation;
  rootId: string;
  labelId: string;
  itemId: (value: string) => string;
  inputId: (value: string) => string;
  itemTextId: (value: string) => string;
  focused: { value: string | null; visible: boolean };
  setFocused: (focused: { value: string | null; visible: boolean }) => void;
  setLabelRendered: (rendered: boolean) => void;
  focusFirst: () => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(part: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error(`${part} must be placed inside its radio group's Root.`);
  return context;
}

export const RadioGroupProvider = RadioGroupContext.Provider;

/** A radio group on native `<input type="radio">`s sharing a `name`, so arrow keys move between them. */
export function useRadioGroupRoot({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  name: nameProp,
  form,
  disabled: disabledProp,
  readOnly = false,
  invalid: invalidProp,
  required = false,
  orientation = "vertical",
  id: idProp,
}: RadioGroupRootOptions) {
  const fieldset = useFieldsetContext();
  const uid = useId();
  const id = idProp ?? uid;
  const rootRef = useRef<HTMLDivElement>(null);
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const [focused, setFocused] = useState<{ value: string | null; visible: boolean }>({
    value: null,
    visible: false,
  });
  const [labelRendered, setLabelRendered] = useState(false);
  const name = nameProp ?? id;
  const latest = useLatestRef({ value, name });

  const requestChange = (next: string | null, reason: RadioValueChangeReason, event?: Event) => {
    const details = createChangeDetails(reason, event);
    onValueChange?.(next, details);
    if (!details.canceled) setValue(next);
  };

  const syncInputs = useCallback(() => {
    const radios = rootRef.current?.querySelectorAll<HTMLInputElement>("input[type=radio]") ?? [];
    for (const radio of radios) {
      if (radio.name === latest.current.name) radio.checked = radio.value === latest.current.value;
    }
  }, [latest]);

  const { fieldsetDisabled } = useFormControl(
    rootRef,
    () => {
      if (value !== initialValue) requestChange(initialValue, "form-reset");
      // The form resets its radios after the event, which overwrites the shown value.
      requestAnimationFrame(syncInputs);
    },
    () => rootRef.current?.querySelector("input[type=radio]"),
  );

  const disabled = (disabledProp ?? fieldset?.disabled ?? false) || fieldsetDisabled;
  const invalid = invalidProp ?? fieldset?.invalid ?? false;
  const rootId = `radio-group:${id}`;
  const labelId = `radio-group:${id}:label`;
  const itemId = useCallback((item: string) => `radio-group:${id}:radio:${item}`, [id]);

  const context: RadioGroupContextValue = {
    value,
    select: (next, event) => requestChange(next, "input-change", event),
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    orientation,
    rootId,
    labelId,
    itemId,
    inputId: (item) => `radio-group:${id}:radio:input:${item}`,
    itemTextId: (item) => `radio-group:${id}:radio:label:${item}`,
    focused,
    setFocused,
    setLabelRendered,
    focusFirst: () => {
      const root = rootRef.current;
      const input =
        root?.querySelector<HTMLInputElement>("input:not(:disabled):checked") ??
        root?.querySelector<HTMLInputElement>("input:not(:disabled)");
      input?.focus();
    },
  };

  return {
    context,
    rootProps: {
      ref: rootRef,
      id: rootId,
      role: "radiogroup",
      "aria-labelledby": labelRendered ? labelId : fieldset?.ids.legend,
      "aria-required": required || undefined,
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-orientation": orientation,
      "data-orientation": orientation,
      "data-disabled": dataAttr(disabled),
      "data-invalid": dataAttr(invalid),
      "data-required": dataAttr(required),
    },
  };
}

export function useRadioGroupLabelProps() {
  const context = useRadioGroupContext("RadioGroup.Label");
  const { setLabelRendered } = context;

  useLayoutEffect(() => {
    setLabelRendered(true);
    return () => setLabelRendered(false);
  }, [setLabelRendered]);

  return {
    id: context.labelId,
    "data-orientation": context.orientation,
    "data-disabled": dataAttr(context.disabled),
    "data-invalid": dataAttr(context.invalid),
    "data-required": dataAttr(context.required),
    onClick: context.focusFirst,
  };
}

export interface RadioItemOptions {
  value: string;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
}

export interface RadioItemState {
  value: string;
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  focusVisible: boolean;
}

export interface RadioItem {
  state: RadioItemState;
  attributes: RadioItemAttributes;
  textId: string;
}

type RadioItemAttributes = Record<
  | "data-checked"
  | "data-unchecked"
  | "data-disabled"
  | "data-read-only"
  | "data-invalid"
  | "data-focus-visible",
  "" | undefined
> & { "data-orientation": RadioGroupOrientation };

const RadioItemContext = createContext<RadioItem | null>(null);

export const RadioItemProvider = RadioItemContext.Provider;

export function useRadioItemContext(part: string): RadioItem {
  const context = useContext(RadioItemContext);
  if (!context) throw new Error(`${part} must be placed inside a radio item.`);
  return context;
}

const hiddenInputClass = visuallyHidden();

/** The props of a radio item's parts: the `<label>`, its hidden input, control and text. */
export function useRadioItem({
  value,
  disabled: disabledProp,
  invalid: invalidProp,
}: RadioItemOptions) {
  const group = useRadioGroupContext("A radio item");
  const state: RadioItemState = {
    value,
    checked: group.value === value,
    disabled: !!disabledProp || group.disabled,
    invalid: !!invalidProp || group.invalid,
    focusVisible: group.focused.value === value && group.focused.visible,
  };
  const attributes: RadioItemAttributes = {
    "data-checked": dataAttr(state.checked),
    "data-unchecked": dataAttr(!state.checked),
    "data-disabled": dataAttr(state.disabled),
    "data-read-only": dataAttr(group.readOnly),
    "data-invalid": dataAttr(state.invalid),
    "data-focus-visible": dataAttr(state.focusVisible),
    "data-orientation": group.orientation,
  };
  const inputId = group.inputId(value);

  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    id: inputId,
    type: "radio",
    className: hiddenInputClass,
    name: group.name,
    form: group.form,
    value,
    required: group.required,
    checked: state.checked,
    disabled: state.disabled || group.readOnly,
    "aria-labelledby": group.itemTextId(value),
    "aria-invalid": state.invalid || undefined,
    onClick(event: MouseEvent<HTMLInputElement>) {
      if (group.readOnly) event.preventDefault();
    },
    onChange(event: ChangeEvent<HTMLInputElement>) {
      if (group.readOnly || !event.currentTarget.checked) return;
      group.select(value, event.nativeEvent);
    },
    onFocus(event: FocusEvent<HTMLInputElement>) {
      group.setFocused({ value, visible: event.currentTarget.matches(":focus-visible") });
    },
    onBlur() {
      group.setFocused({ value: null, visible: false });
    },
  };

  return {
    item: { state, attributes, textId: group.itemTextId(value) } satisfies RadioItem,
    itemProps: {
      ...attributes,
      id: group.itemId(value),
      htmlFor: inputId,
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (state.disabled || event.button !== 0) return;
        // A mouse press on the label would blur the focused input to the body.
        if (group.focused.value === value && event.pointerType === "mouse") event.preventDefault();
      },
      onClick() {
        if (!state.disabled && isSafari()) document.getElementById(inputId)?.focus();
      },
    },
    inputProps,
  };
}

export interface RadioIndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const sameRect = (a: RadioIndicatorRect | null, b: RadioIndicatorRect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height);

const offsetRect = (element: HTMLElement): RadioIndicatorRect => ({
  left: element.offsetLeft,
  top: element.offsetTop,
  width: element.offsetWidth,
  height: element.offsetHeight,
});

/** The checked item's offset box, kept current as the items resize, for an indicator that slides to it. */
export function useRadioIndicator() {
  const group = useRadioGroupContext("RadioGroup.Indicator");
  const { rootId, itemId: itemIdOf, orientation } = group;
  const [rect, setRect] = useState<RadioIndicatorRect | null>(null);
  const itemId = group.value === null ? null : itemIdOf(group.value);

  useLayoutEffect(() => {
    const measure = () => {
      const item = itemId === null ? null : document.getElementById(itemId);
      const next = item ? offsetRect(item) : null;
      setRect((previous) => (sameRect(previous, next) ? previous : next));
    };
    measure();
    const root = document.getElementById(rootId);
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root, { box: "border-box" });
    for (const radio of root.querySelectorAll<HTMLInputElement>("input[type=radio]")) {
      const item = document.getElementById(itemIdOf(radio.value));
      if (item) observer.observe(item, { box: "border-box" });
    }
    return () => observer.disconnect();
  }, [rootId, itemId, itemIdOf, orientation]);

  const empty =
    !rect || (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0);
  return {
    hidden: group.value === null || empty,
    "data-orientation": group.orientation,
    "data-disabled": dataAttr(group.disabled),
    style: rect
      ? {
          "--indicator-left": `${rect.left}px`,
          "--indicator-top": `${rect.top}px`,
          "--indicator-width": `${rect.width}px`,
          "--indicator-height": `${rect.height}px`,
        }
      : undefined,
  };
}
