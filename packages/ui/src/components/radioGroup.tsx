import {
  type ChangeEvent,
  type CSSProperties,
  type ComponentProps,
  type ComponentType,
  type FocusEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { isSafari } from "../foundations/platform";
import { splitOptions } from "../foundations/props";
import { useComposedRefs } from "../hooks/useComposedRefs";
import { useControllableState } from "../hooks/useControllableState";
import { useLatestRef } from "../hooks/useLatestRef";
import {
  type RenderedParts,
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../primitives/change";
import {
  hiddenInputClass,
  useFieldFocusControl,
  useFieldsetContext,
  useFormFieldState,
} from "../primitives/field";
import {
  checkedStateAttributes,
  dataAttr,
  fieldStateAttributes,
  mergeProps,
  renderable,
} from "../primitives/render";
import { createPartContext } from "./partContext";
import { useSlidingIndicator } from "./slidingIndicator";

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

/** Every `RadioGroupRootOptions` key, to split them off a group root's props. */
export const RADIO_GROUP_ROOT_KEYS = {
  value: true,
  defaultValue: true,
  onValueChange: true,
  name: true,
  form: true,
  disabled: true,
  readOnly: true,
  invalid: true,
  required: true,
  orientation: true,
  id: true,
} as const satisfies Record<keyof RadioGroupRootOptions, true>;

type RadioGroupRootProps = RadioGroupRootOptions & { ref?: Ref<HTMLDivElement> | undefined };

type RadioGroupPart = "label" | `item:${string}`;

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
  /** The ids an item and its input and text render with unless given their own. */
  itemId: (value: string) => string;
  inputId: (value: string) => string;
  itemTextId: (value: string) => string;
  rendered: RenderedParts<RadioGroupPart>;
  reportRendered: ReportRendered<RadioGroupPart>;
  focused: { value: string | null; visible: boolean };
  setFocused: (focused: { value: string | null; visible: boolean }) => void;
  focusFirst: () => void;
}

const [RadioGroupContext, useRadioGroupContext] =
  createPartContext<RadioGroupContextValue>("its radio group's Root");

export const RadioGroupProvider = RadioGroupContext.Provider;

/**
 * A radio group on native `<input type="radio">`s sharing a `name`, so arrow keys move between them.
 * Takes the root's props; `rootProps` carries the ones that aren't options, over its own.
 */
export function useRadioGroupRoot<P extends RadioGroupRootProps>(
  props: P,
  defaults: Pick<RadioGroupRootOptions, "orientation"> = {},
) {
  const [options, { ref, ...rest }] = splitOptions<
    RadioGroupRootProps,
    keyof RadioGroupRootOptions
  >(props, RADIO_GROUP_ROOT_KEYS);
  const {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    name: nameProp,
    form,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    invalid: invalidProp,
    required: requiredProp,
    orientation = defaults.orientation ?? "vertical",
    id: idProp,
  } = options;
  const fieldset = useFieldsetContext();
  const uid = useId();
  const id = idProp ?? uid;
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(rootRef, ref);
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const [focused, setFocused] = useState<{ value: string | null; visible: boolean }>({
    value: null,
    visible: false,
  });
  const [rendered, reportRendered] = useRenderedParts<RadioGroupPart>();
  const name = nameProp ?? id;
  const latest = useLatestRef({ value, name });

  const requestChange = (next: string | null, reason: RadioValueChangeReason, event?: Event) => {
    if (emitChange(onValueChange, next, reason, event)) setValue(next);
  };

  const syncInputs = useCallback(() => {
    const radios = rootRef.current?.querySelectorAll<HTMLInputElement>("input[type=radio]") ?? [];
    for (const radio of radios) {
      if (radio.name === latest.current.name) radio.checked = radio.value === latest.current.value;
    }
  }, [latest]);

  // The generated name only groups the radios; a group given no `name` submits nothing.
  useEffect(() => {
    const root = rootRef.current;
    if (nameProp !== undefined || !root) return;
    const scope = root.getRootNode();
    const dropEntry = (event: Event) => {
      const owner = root.querySelector<HTMLInputElement>("input[type=radio]")?.form;
      if (owner && event.target === owner) (event as FormDataEvent).formData.delete(name);
    };
    scope.addEventListener("formdata", dropEntry, { capture: true });
    return () => scope.removeEventListener("formdata", dropEntry, { capture: true });
  }, [nameProp, name]);

  const {
    disabled,
    readOnly,
    invalid,
    required,
    labelId: fieldLabelId,
    describedBy,
  } = useFormFieldState(
    {
      disabled: disabledProp,
      readOnly: readOnlyProp,
      invalid: invalidProp ?? (fieldset?.invalid || undefined),
      required: requiredProp,
    },
    {
      elementRef: rootRef,
      onReset() {
        if (value !== initialValue) requestChange(initialValue, "form-reset");
      },
      input: () => rootRef.current?.querySelector("input[type=radio]"),
      afterReset: syncInputs,
    },
  );
  const rootId = `radio-group:${id}`;
  const labelId = `radio-group:${id}:label`;
  const itemId = useCallback((item: string) => `radio-group:${id}:radio:${item}`, [id]);
  const focusFirst = () => {
    const root = rootRef.current;
    const input =
      root?.querySelector<HTMLInputElement>("input:not(:disabled):checked") ??
      root?.querySelector<HTMLInputElement>("input:not(:disabled)");
    input?.focus();
  };
  useFieldFocusControl(focusFirst);

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
    rendered,
    reportRendered,
    focused,
    setFocused,
    focusFirst,
  };

  return {
    context,
    rootProps: {
      id: rootId,
      role: "radiogroup",
      "aria-labelledby": rendered.label ?? fieldLabelId ?? fieldset?.legendId,
      "aria-describedby": describedBy,
      "aria-required": required || undefined,
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-orientation": orientation,
      "data-orientation": orientation,
      ...fieldStateAttributes({ disabled, invalid, required }),
      ...(rest as Omit<P, keyof RadioGroupRootProps>),
      ref: composedRef,
    },
  };
}

function useRadioGroupLabelProps(id: string | undefined) {
  const context = useRadioGroupContext("RadioGroup.Label");

  return {
    id: useReportRendered(context.reportRendered, "label", id ?? context.labelId),
    "data-orientation": context.orientation,
    ...fieldStateAttributes({
      disabled: context.disabled,
      invalid: context.invalid,
      required: context.required,
    }),
    onClick: context.focusFirst,
  };
}

export interface RadioItemOptions {
  value: string;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
}

type RadioItemPart = "input" | "text";

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
  /** The ids its input and text render with unless given their own. */
  ids: Record<RadioItemPart, string>;
  reportRendered: ReportRendered<RadioItemPart>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
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

export const [RadioItemContext, useRadioItemContext] = createPartContext<RadioItem>("a radio item");

export const RadioItemProvider = RadioItemContext.Provider;

/**
 * The props of a radio item's parts: the `<label>`, given its own `id`, its hidden input, control
 * and text.
 */
export function useRadioItem({
  value,
  disabled: disabledProp,
  invalid: invalidProp,
  id,
}: RadioItemOptions & { id?: string | undefined }) {
  const group = useRadioGroupContext("A radio item");
  const [rendered, reportRendered] = useRenderedParts<RadioItemPart>();
  const itemId = useReportRendered(
    group.reportRendered,
    `item:${value}`,
    id ?? group.itemId(value),
  );
  const state: RadioItemState = {
    value,
    checked: group.value === value,
    disabled: !!disabledProp || group.disabled,
    invalid: !!invalidProp || group.invalid,
    focusVisible: group.focused.value === value && group.focused.visible,
  };
  const attributes: RadioItemAttributes = {
    ...checkedStateAttributes(state.checked),
    ...fieldStateAttributes({
      disabled: state.disabled,
      readOnly: group.readOnly,
      invalid: state.invalid,
    }),
    "data-focus-visible": dataAttr(state.focusVisible),
    "data-orientation": group.orientation,
  };
  const ids = { input: group.inputId(value), text: group.itemTextId(value) };

  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    id: ids.input,
    type: "radio",
    className: hiddenInputClass,
    name: group.name,
    form: group.form,
    value,
    required: group.required,
    checked: state.checked,
    disabled: state.disabled,
    "aria-labelledby": rendered.text,
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
    item: { state, attributes, ids, reportRendered, inputProps } satisfies RadioItem,
    itemProps: {
      ...attributes,
      id: itemId,
      htmlFor: rendered.input,
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (state.disabled || event.button !== 0) return;
        // A mouse press on the label would blur the focused input to the body.
        if (group.focused.value === value && event.pointerType === "mouse") event.preventDefault();
      },
      onClick() {
        if (state.disabled || !isSafari() || !rendered.input) return;
        document.getElementById(rendered.input)?.focus();
      },
    },
  };
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

/** The native radio of the item its `RadioItemProvider` gives, with `props` merged over its own. */
export function RadioItemHiddenInput(props: HiddenInputProps) {
  const { inputProps, ids, reportRendered } = useRadioItemContext("SegmentGroup.ItemHiddenInput");
  const id = useReportRendered(reportRendered, "input", props.id ?? ids.input);
  return <renderable.input {...mergeProps<HiddenInputProps>(inputProps, props, { id })} />;
}

/** The id a radio item's text renders with, `id` when given, which names its radio. */
export function useRadioItemTextId(item: RadioItem, id?: string): string {
  return useReportRendered(item.reportRendered, "text", id ?? item.ids.text);
}

function useRadioIndicator() {
  const group = useRadioGroupContext("RadioGroup.Indicator");
  const { rootId, rendered, value } = group;
  const itemOf = (item: string) => {
    const id = rendered[`item:${item}`];
    return id === undefined ? null : document.getElementById(id);
  };
  const indicator = useSlidingIndicator(
    {
      selected: () => (value === null ? null : itemOf(value)),
      observed: () => {
        const root = document.getElementById(rootId);
        if (!root) return [];
        const radios = [...root.querySelectorAll<HTMLInputElement>("input[type=radio]")];
        const items = radios.map((radio) => itemOf(radio.value));
        return [root, ...items.filter((item) => item !== null)];
      },
    },
    // The items report their ids after the first commit.
    value === null ? null : (rendered[`item:${value}`] ?? null),
    group.orientation,
  );
  return {
    ...indicator,
    "data-orientation": group.orientation,
    "data-disabled": dataAttr(group.disabled),
  };
}

interface RadioGroupPartSlots<L, I, C, T> {
  Label: ComponentType<L>;
  Indicator: ComponentType<I>;
  ItemControl: ComponentType<C>;
  ItemText: ComponentType<T>;
}

/**
 * A radio group's label, the indicator that slides to its checked item, and an item's control and
 * text, on the recipe's styled `slots`; `owner` names them in a missing-context error.
 */
export function createRadioGroupParts<
  L extends object,
  I extends { style?: CSSProperties | undefined },
  C extends object,
  T extends object,
>(slots: RadioGroupPartSlots<L, I, C, T>, owner: string) {
  const { Label: StyledLabel, Indicator: StyledIndicator } = slots;
  const { ItemControl: StyledItemControl, ItemText: StyledItemText } = slots;

  function Label(props: L) {
    const own = useRadioGroupLabelProps((props as { id?: string | undefined }).id);
    return <StyledLabel {...mergeProps<L>(own as L, props)} />;
  }

  /** Slides to the checked item. */
  function Indicator(props: I) {
    const { style, ...indicator } = useRadioIndicator();
    return (
      <StyledIndicator
        {...indicator}
        {...props}
        style={{ ...style, ...props.style }}
      />
    );
  }

  function ItemControl(props: C) {
    const { attributes } = useRadioItemContext(`${owner}.ItemControl`);
    return (
      <StyledItemControl
        aria-hidden
        {...attributes}
        {...props}
      />
    );
  }

  function ItemText(props: T) {
    const item = useRadioItemContext(`${owner}.ItemText`);
    const textId = useRadioItemTextId(item, (props as { id?: string | undefined }).id);
    return (
      <StyledItemText
        {...item.attributes}
        {...props}
        id={textId}
      />
    );
  }

  return { Label, Indicator, ItemControl, ItemText };
}
