import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  createRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { editable } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { matchesShortcut } from "../../foundations/shortcuts";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { type ChangeDetails, createChangeDetails, emitChange } from "../../primitives/change";
import { useFieldControlId, useFieldControlState } from "../../primitives/field";
import { isWithinFocusable } from "../../primitives/focus";
import { type DismissReason, useLayer } from "../../primitives/layer";
import { dataAttr, fieldStateAttributes, mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";

export type EditableChangeReason =
  | "input-change"
  | "trigger-press"
  | "preview-press"
  | "preview-focus"
  | "preview-key"
  | "submit-press"
  | "cancel-press"
  | "enter-key"
  | DismissReason
  | "none";

/** Why a callback was called, and a way to keep the editable as it is. */
export type EditableChangeDetails = ChangeDetails<EditableChangeReason>;

export interface EditableTranslations {
  /** The input's name when no label names it. @default "editable input" */
  input: string;
  /** The preview's and edit trigger's `aria-label`. @default "edit" */
  edit: string;
  /** @default "submit" */
  submit: string;
  /** @default "cancel" */
  cancel: string;
}

const defaultTranslations: EditableTranslations = {
  input: "editable input",
  edit: "edit",
  submit: "submit",
  cancel: "cancel",
};

export interface EditableOwnProps {
  value?: string | undefined;
  /** @default "" */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string, details: EditableChangeDetails) => void) | undefined;
  /** Whether the input shows in place of the preview. */
  editing?: boolean | undefined;
  /** @default false */
  defaultEditing?: boolean | undefined;
  /** Called when editing starts or ends; `details.cancel()` keeps it as it is. */
  onEditingChange?: ((editing: boolean, details: EditableChangeDetails) => void) | undefined;
  /** Called with the kept value once editing ends by a submit. */
  onValueCommit?: ((value: string, details: EditableChangeDetails) => void) | undefined;
  /** Called with the restored value once editing ends without a submit. */
  onValueRevert?: ((value: string, details: EditableChangeDetails) => void) | undefined;
  /** What on the preview starts editing. @default "focus" */
  activationMode?: "focus" | "dblclick" | "click" | "none" | undefined;
  /** What keeps the value: Enter, leaving the input, both or neither. @default "both" */
  submitMode?: "enter" | "blur" | "both" | "none" | undefined;
  /** Selects the text as editing starts. @default true */
  selectOnFocus?: boolean | undefined;
  /** Shown while the value is empty; an object gives the input and the preview their own. */
  placeholder?: string | { edit: string; preview: string } | undefined;
  maxLength?: number | undefined;
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** The element focus returns to once editing ends; defaults to the edit trigger, else the preview. */
  finalFocusEl?: (() => HTMLElement | null) | undefined;
  /** Sizes the area to the text instead of its container. */
  autoResize?: boolean | undefined;
  translations?: Partial<EditableTranslations> | undefined;
}

interface EditableContextValue {
  value: string;
  editing: boolean;
  empty: boolean;
  interactive: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  autoResize: boolean;
  activationMode: NonNullable<EditableOwnProps["activationMode"]>;
  submitOnEnter: boolean;
  placeholder: { edit: string; preview: string } | undefined;
  maxLength: number | undefined;
  name: string | undefined;
  form: string | undefined;
  translations: EditableTranslations;
  describedBy: string | undefined;
  ids: { label: string; input: string; preview: string; area: string; control: string };
  /** The rendered input's id. */
  inputId: string | undefined;
  labelledBy: string | undefined;
  reportRendered: ReportRendered<"label" | "input">;
  refs: {
    input: RefObject<HTMLInputElement | null>;
    preview: RefObject<HTMLElement | null>;
    editTrigger: RefObject<HTMLButtonElement | null>;
    submitTrigger: RefObject<HTMLButtonElement | null>;
    cancelTrigger: RefObject<HTMLButtonElement | null>;
  };
  returningFocus: RefObject<boolean>;
  setValue: (value: string, reason: EditableChangeReason, event?: Event) => void;
  edit: (reason: EditableChangeReason, event?: Event) => void;
  submit: (reason: EditableChangeReason, event?: Event) => void;
  cancel: (reason: EditableChangeReason, event?: Event) => void;
}

const [EditableContext, useEditable] = createPartContext<EditableContextValue>("<Editable.Root>");

interface Leave {
  submit: boolean;
  focusable: boolean;
  details: EditableChangeDetails;
}

type RootImplProps = Omit<ComponentProps<typeof renderable.div>, keyof EditableOwnProps> &
  EditableOwnProps;

function RootImpl({
  id: idProp,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  editing: editingProp,
  defaultEditing = false,
  onEditingChange,
  onValueCommit,
  onValueRevert,
  activationMode = "focus",
  submitMode = "both",
  selectOnFocus = true,
  placeholder: placeholderProp,
  maxLength,
  name,
  form,
  disabled: disabledProp,
  readOnly: readOnlyProp,
  invalid: invalidProp,
  required: requiredProp,
  finalFocusEl,
  autoResize = false,
  translations,
  ...props
}: RootImplProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const field = useFieldControlState({
    disabled: disabledProp,
    readOnly: readOnlyProp,
    invalid: invalidProp,
    required: requiredProp,
  });
  const [value, setValueState] = useControllableState({ value: valueProp, defaultValue });
  const [editing, setEditingState] = useControllableState({
    value: editingProp,
    defaultValue: defaultEditing,
  });
  const [rendered, reportRendered] = useRenderedParts<"label" | "input">();
  const [refs] = useState(() => ({
    input: createRef<HTMLInputElement>(),
    preview: createRef<HTMLElement>(),
    editTrigger: createRef<HTMLButtonElement>(),
    submitTrigger: createRef<HTMLButtonElement>(),
    cancelTrigger: createRef<HTMLButtonElement>(),
  }));
  const returningFocus = useRef(false);
  const previousValue = useRef(valueProp ?? defaultValue);
  const leave = useRef<Leave | null>(null);
  const wasEditing = useRef(false);

  const interactive = !(field.disabled || field.readOnly);
  const submitOnEnter = submitMode === "both" || submitMode === "enter";
  const submitOnBlur = submitMode === "both" || submitMode === "blur";

  const setValue = (next: string, reason: EditableChangeReason, event?: Event) => {
    const limited = maxLength != null ? next.slice(0, maxLength) : next;
    if (limited === latest.current.value) return;
    if (emitChange(onValueChange, limited, reason, event)) setValueState(limited);
  };

  const requestEditing = (
    next: boolean,
    reason: EditableChangeReason,
    event: Event | undefined,
    ending?: { submit: boolean; focusable: boolean },
  ) => {
    if (next === latest.current.editing) return false;
    if (!emitChange(onEditingChange, next, reason, event)) return false;
    leave.current = ending ? { ...ending, details: createChangeDetails(reason, event) } : null;
    setEditingState(next);
    return true;
  };

  const latest = useLatestRef({
    value,
    editing,
    selectOnFocus,
    finalFocusEl,
    onValueCommit,
    onValueRevert,
    setValue,
  });

  useLayoutEffect(() => {
    if (editing === wasEditing.current) return;
    wasEditing.current = editing;
    const current = latest.current;

    if (editing) {
      previousValue.current = current.value;
      leave.current = null;
      const input = refs.input.current;
      if (current.selectOnFocus) input?.select();
      else input?.focus({ preventScroll: true });
      return;
    }

    const ended = leave.current ?? {
      submit: false,
      focusable: false,
      details: createChangeDetails<EditableChangeReason>("none"),
    };
    leave.current = null;
    if (ended.submit) {
      previousValue.current = current.value;
      current.onValueCommit?.(current.value, ended.details);
    } else {
      const restored = previousValue.current;
      current.setValue(restored, ended.details.reason, ended.details.event);
      current.onValueRevert?.(restored, ended.details);
    }
    if (ended.focusable) return;
    const editTrigger = refs.editTrigger.current;
    const target =
      current.finalFocusEl?.() ??
      (editTrigger?.isConnected && !editTrigger.hidden ? editTrigger : refs.preview.current);
    returningFocus.current = true;
    target?.focus({ preventScroll: true });
    returningFocus.current = false;
  }, [editing, latest, refs]);

  const end = (submit: boolean, reason: EditableChangeReason, event?: Event, focusable = false) =>
    requestEditing(false, reason, event, { submit, focusable });

  useLayer(editing && interactive, {
    contains: (target) =>
      [refs.input, refs.submitTrigger, refs.cancelTrigger].some(
        (ref) => ref.current?.contains(target) ?? false,
      ),
    dismiss: (reason, event) => {
      if (reason === "escape-key") return end(false, reason, event);
      const focusable = reason === "focus-out" || isWithinFocusable(event.target);
      return end(submitOnBlur, reason, event, focusable);
    },
  });

  const placeholder =
    typeof placeholderProp === "string"
      ? { edit: placeholderProp, preview: placeholderProp }
      : placeholderProp;

  const context: EditableContextValue = {
    value,
    editing,
    empty: value.trim() === "",
    interactive,
    disabled: field.disabled,
    readOnly: field.readOnly,
    invalid: field.invalid,
    required: field.required,
    autoResize,
    activationMode,
    submitOnEnter,
    placeholder,
    maxLength,
    name,
    form,
    translations: { ...defaultTranslations, ...translations },
    describedBy: field.describedBy,
    ids: {
      label: `editable:${id}:label`,
      input: `editable:${id}:input`,
      preview: `editable:${id}:preview`,
      area: `editable:${id}:area`,
      control: `editable:${id}:control`,
    },
    inputId: rendered.input,
    labelledBy: field.labelId ?? rendered.label,
    reportRendered,
    refs,
    returningFocus,
    setValue,
    edit: (reason, event) => {
      if (interactive) requestEditing(true, reason, event);
    },
    submit: (reason, event) => {
      if (interactive) end(true, reason, event);
    },
    cancel: (reason, event) => {
      if (interactive) end(false, reason, event);
    },
  };

  return (
    <EditableContext value={context}>
      <renderable.div
        id={`editable:${id}`}
        {...props}
      />
    </EditableContext>
  );
}

const { withProvider, withContext } = createSlotRecipeContext(editable);

const Root = withProvider(RootImpl, "root", { forwardProps: ["autoResize"] });
const StyledArea = withContext(renderable.div, "area");
const StyledCancelTrigger = withContext(renderable.button, "cancelTrigger");
const StyledControl = withContext(renderable.div, "control");
const StyledEditTrigger = withContext(renderable.button, "editTrigger");
const StyledInput = withContext(renderable.input, "input");
const StyledLabel = withContext(renderable.label, "label");
const StyledPreview = withContext(renderable.span, "preview");
const StyledSubmitTrigger = withContext(renderable.button, "submitTrigger");

export type EditableRootProps = ComponentProps<typeof Root>;

type AreaProps = ComponentProps<typeof StyledArea>;

function Area(props: AreaProps) {
  const context = useEditable("Editable.Area");
  return (
    <StyledArea
      {...mergeProps<AreaProps>(
        {
          id: context.ids.area,
          "data-focus": dataAttr(context.editing),
          "data-disabled": dataAttr(context.disabled),
          "data-placeholder-shown": dataAttr(context.empty),
        } as AreaProps,
        props,
      )}
    />
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const context = useEditable("Editable.Label");
  const labelId = useReportRendered(context.reportRendered, "label", props.id ?? context.ids.label);

  return (
    <StyledLabel
      {...mergeProps<LabelProps>(
        {
          id: labelId,
          htmlFor: context.inputId,
          "data-focus": dataAttr(context.editing),
          ...fieldStateAttributes({ invalid: context.invalid, required: context.required }),
          onClick() {
            if (!context.editing) context.refs.preview.current?.focus({ preventScroll: true });
          },
        } as LabelProps,
        props,
      )}
    />
  );
}

type InputProps = ComponentProps<typeof StyledInput>;

function Input({ ref, ...props }: InputProps) {
  const context = useEditable("Editable.Input");
  const composedRef = useComposedRefs(context.refs.input, ref);
  const inputId = useReportRendered(
    context.reportRendered,
    "input",
    useFieldControlId(props.id) ?? context.ids.input,
  );
  const hidden = !context.editing;

  return (
    <StyledInput
      {...mergeProps<InputProps>(
        {
          id: inputId,
          "aria-label": context.translations.input,
          "aria-labelledby": context.labelledBy,
          "aria-describedby": context.describedBy,
          name: context.name,
          form: context.form,
          hidden: context.autoResize ? undefined : hidden,
          "data-hidden": dataAttr(context.autoResize && hidden),
          placeholder: context.placeholder?.edit,
          maxLength: context.maxLength,
          required: context.required,
          disabled: context.disabled,
          readOnly: context.readOnly,
          "aria-invalid": context.invalid || undefined,
          ...fieldStateAttributes({
            disabled: context.disabled,
            invalid: context.invalid,
            readOnly: context.readOnly,
          }),
          size: context.autoResize ? 1 : undefined,
          value: context.value,
          onChange(event: ChangeEvent<HTMLInputElement>) {
            context.setValue(event.currentTarget.value, "input-change", event.nativeEvent);
          },
          onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
            if (event.defaultPrevented || isComposingEvent(event)) return;
            if (event.key === "Escape") {
              context.cancel("escape-key", event.nativeEvent);
              event.preventDefault();
              return;
            }
            if (event.key !== "Enter" || !context.submitOnEnter) return;
            const submits =
              event.currentTarget.localName === "textarea"
                ? matchesShortcut(event.nativeEvent, "Mod+Enter")
                : !event.shiftKey && !event.metaKey;
            if (!submits) return;
            context.submit("enter-key", event.nativeEvent);
            event.preventDefault();
          },
        } as InputProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

type PreviewProps = ComponentProps<typeof StyledPreview>;

/** Shows the value, or the placeholder while it is empty; Enter or F2 on it starts editing. */
function Preview({ ref, children, ...props }: PreviewProps) {
  const context = useEditable("Editable.Preview");
  const composedRef = useComposedRefs(context.refs.preview, ref);
  const { editing, interactive, activationMode } = context;

  return (
    <StyledPreview
      {...mergeProps<PreviewProps>(
        {
          id: context.ids.preview,
          "data-placeholder-shown": dataAttr(context.empty),
          "aria-readonly": context.readOnly || undefined,
          "aria-disabled": context.disabled || undefined,
          "aria-invalid": context.invalid || undefined,
          ...fieldStateAttributes({
            disabled: context.disabled,
            invalid: context.invalid,
            readOnly: context.readOnly,
          }),
          "aria-label": context.translations.edit,
          hidden: context.autoResize ? undefined : editing,
          "data-hidden": dataAttr(context.autoResize && editing),
          tabIndex: interactive ? 0 : undefined,
          onFocusCapture(event: FocusEvent<HTMLElement>) {
            if (context.returningFocus.current) event.stopPropagation();
          },
          onFocus(event: FocusEvent<HTMLElement>) {
            if (activationMode === "focus") context.edit("preview-focus", event.nativeEvent);
          },
          onMouseDown(event: MouseEvent<HTMLElement>) {
            if (event.defaultPrevented || event.button !== 0 || activationMode !== "focus") return;
            if (editing || !interactive) return;
            // The press would set the selection in the hidden preview, taking focus from the input.
            event.preventDefault();
            context.edit("preview-focus", event.nativeEvent);
          },
          onClick(event: MouseEvent<HTMLElement>) {
            if (activationMode === "click") context.edit("preview-press", event.nativeEvent);
          },
          onDoubleClick(event: MouseEvent<HTMLElement>) {
            if (event.defaultPrevented || activationMode !== "dblclick") return;
            context.edit("preview-press", event.nativeEvent);
          },
          onKeyDown(event: KeyboardEvent<HTMLElement>) {
            if (event.defaultPrevented || editing || !interactive) return;
            if (event.key !== "Enter" && event.key !== "F2") return;
            event.preventDefault();
            context.edit("preview-key", event.nativeEvent);
          },
        } as PreviewProps,
        props,
      )}
      ref={composedRef}
    >
      {children ?? (context.empty ? (context.placeholder?.preview ?? "") : context.value)}
    </StyledPreview>
  );
}

type TriggerProps = ComponentProps<typeof StyledEditTrigger>;

function triggerPart(
  action: "edit" | "submit" | "cancel",
  StyledTrigger: typeof StyledEditTrigger,
  part: string,
  reason: EditableChangeReason,
) {
  return function Trigger({ ref, ...props }: TriggerProps) {
    const context = useEditable(part);
    const composedRef = useComposedRefs(context.refs[`${action}Trigger` as const], ref);
    return (
      <StyledTrigger
        {...mergeProps<TriggerProps>(
          {
            "aria-label": context.translations[action],
            hidden: action === "edit" ? context.editing : !context.editing,
            type: props.render ? undefined : "button",
            disabled: context.disabled,
            onClick(event: MouseEvent<HTMLButtonElement>) {
              if (!event.defaultPrevented) context[action](reason, event.nativeEvent);
            },
          },
          props,
        )}
        ref={composedRef}
      />
    );
  };
}

const EditTrigger = triggerPart("edit", StyledEditTrigger, "Editable.EditTrigger", "trigger-press");
const SubmitTrigger = triggerPart(
  "submit",
  StyledSubmitTrigger,
  "Editable.SubmitTrigger",
  "submit-press",
);
const CancelTrigger = triggerPart(
  "cancel",
  StyledCancelTrigger,
  "Editable.CancelTrigger",
  "cancel-press",
);

type ControlProps = ComponentProps<typeof StyledControl>;

function Control(props: ControlProps) {
  const context = useEditable("Editable.Control");
  return (
    <StyledControl
      id={context.ids.control}
      {...props}
    />
  );
}

export const Editable = {
  Root,
  Area,
  CancelTrigger,
  Control,
  EditTrigger,
  Input,
  Label,
  Preview,
  SubmitTrigger,
};
