import {
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { isComposingEvent } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import { dispatchInputValueEvent, useFieldControlState } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr } from "../../primitives/render";

export type PinInputType = "numeric" | "alphabetic" | "alphanumeric";

export type PinInputValueChangeReason = "input-change" | "paste" | "delete";

/** Why `onValueChange` was called, the value as one string, and a way to keep the value as it is. */
export type PinInputValueChangeDetails = ChangeDetails<PinInputValueChangeReason> & {
  valueAsString: string;
};

export interface PinInputTranslations {
  /** The accessible name of each slot. @default (index, length) => `pin code ${index + 1} of ${length}` */
  inputLabel?: ((index: number, length: number) => string) | undefined;
}

export interface PinInputOptions {
  /** One character per slot. */
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[], details: PinInputValueChangeDetails) => void) | undefined;
  /** Called when every slot is filled. */
  onValueComplete?: ((value: string[], details: { valueAsString: string }) => void) | undefined;
  /** Called with typed or pasted text that `type` or `pattern` rejects, and the focused slot. */
  onValueInvalid?: ((value: string, details: { index: number }) => void) | undefined;
  /** How many slots there are, before the `PinInput.Input`s mount. Defaults to how many render. */
  count?: number | undefined;
  /** The characters a slot takes. @default "numeric" */
  type?: PinInputType | undefined;
  /** A regular expression each typed or pasted value must match, in place of `type`'s. */
  pattern?: string | undefined;
  /** @default "○" */
  placeholder?: string | undefined;
  /** Hides the characters like a password. */
  masked?: boolean | undefined;
  /** Asks the browser to fill the slots with a one-time code. */
  otp?: boolean | undefined;
  autoFocus?: boolean | undefined;
  /** Submits the form around the hidden input once every slot is filled. */
  autoSubmit?: boolean | undefined;
  /** Blurs the slot once every slot is filled. */
  blurOnComplete?: boolean | undefined;
  /** Selects a slot's character when it takes focus. */
  selectOnFocus?: boolean | undefined;
  /** Cleans pasted text before it's checked, e.g. `(value) => value.replace(/-/g, "")`. */
  sanitizeValue?: ((value: string) => string) | undefined;
  translations?: PinInputTranslations | undefined;
  /** The name the hidden input submits the joined value under. */
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Prefixes the ids of the parts. */
  id?: string | undefined;
}

const TYPE_REGEX: Record<PinInputType, RegExp> = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i,
};

const CHAR_PATTERN: Record<PinInputType, string> = {
  numeric: "[0-9]",
  alphabetic: "[A-Za-z]",
  alphanumeric: "[a-zA-Z0-9]",
};

const isValidValue = (value: string, type: PinInputType, pattern: string | undefined) =>
  pattern ? new RegExp(pattern, "g").test(value) : TYPE_REGEX[type].test(value);

function fill(value: readonly string[], count: number | undefined): string[] {
  const length = count || value.length;
  return Array.from({ length }, (_, index) => value[index] || "");
}

function nextSlotValue(current: string, next: string) {
  let value = next;
  if (current[0] === next[0]) value = next[1] ?? "";
  else if (current[0] === next[1]) value = next[0] ?? "";
  return value.split("").at(-1) ?? "";
}

const isEqual = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);

const defaultInputLabel = (index: number, length: number) => `pin code ${index + 1} of ${length}`;

export function usePinInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueComplete,
  onValueInvalid,
  count: countProp,
  type = "numeric",
  pattern,
  placeholder = "○",
  masked = false,
  otp = false,
  autoFocus = false,
  autoSubmit = false,
  blurOnComplete = false,
  selectOnFocus = false,
  sanitizeValue,
  translations,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  id: idProp,
}: PinInputOptions) {
  const uid = useId();
  const id = idProp ?? uid;
  const field = useFieldControlState({ disabled, readOnly, invalid, required });
  const { dir } = useLocale();
  const rootId = `pin-input:${id}`;
  const ids = {
    root: rootId,
    label: `pin-input:${id}:label`,
    hiddenInput: field.id ?? `pin-input:${id}:hidden`,
    control: `pin-input:${id}:control`,
    input: (index: number) => `pin-input:${id}:${index}`,
  };

  const inputsRef = useRef(new Map<number, HTMLInputElement>());
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [renderedCount, setRenderedCount] = useState(0);
  const count = countProp ?? renderedCount;
  const [rawValue, setRawValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? (countProp ? fill([], countProp) : []),
  });
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);

  const value = fill(rawValue, count);
  const valueLength = value.length;
  const filledLength = value.filter((entry) => entry.trim() !== "").length;
  const complete = valueLength > 0 && filledLength === valueLength;
  const valueAsString = value.join("");
  const focusedValue = value[focusedIndex] || "";
  const tabbableIndex =
    focusedIndex !== -1 ? focusedIndex : Math.min(filledLength, valueLength - 1);

  const latest = useLatestRef({ value, valueLength, filledLength, focusedIndex });
  const frames = useRef<number[]>([]);
  const nextFrame = (callback: () => void) => {
    frames.current.push(requestAnimationFrame(callback));
  };
  useEffect(() => {
    const pending = frames.current;
    return () => pending.forEach(cancelAnimationFrame);
  }, []);

  const inputAt = (index: number) =>
    [...inputsRef.current.entries()].sort(([a], [b]) => a - b)[index]?.[1];

  const registerInput = useCallback((index: number, element: HTMLInputElement) => {
    inputsRef.current.set(index, element);
    setRenderedCount(inputsRef.current.size);
    return () => {
      inputsRef.current.delete(index);
      setRenderedCount(inputsRef.current.size);
    };
  }, []);

  const setValue = (next: string[], reason: PinInputValueChangeReason, event?: Event) => {
    if (isEqual(next, value)) return;
    const details = Object.assign(createChangeDetails(reason, event), {
      valueAsString: next.join(""),
    });
    onValueChange?.(next, details);
    if (!details.canceled) setRawValue(next);
  };

  const focusInput = (index: number) => {
    if (index === -1) return;
    queueMicrotask(() => inputAt(index)?.focus({ preventScroll: true }));
  };

  const moveFocus = (index: number) => {
    setFocusedIndex(index);
    focusInput(index);
    if (selectOnFocus && index !== -1) nextFrame(() => inputAt(index)?.select());
  };

  const clearFocusedValue = (index: number, event: Event) => {
    if (index === -1) return;
    const next = [...value];
    next.splice(index, 1);
    next.push("");
    setValue(next, "delete", event);
  };

  const paste = (text: string, event: Event) => {
    const from = focusedIndex;
    nextFrame(() => {
      const current = latest.current;
      const startIndex = Math.min(from, current.filledLength);
      const left = startIndex > 0 ? current.value.join("").substring(0, from) : "";
      const right = text.substring(0, current.valueLength - startIndex);
      const next = fill(`${left}${right}`.split(""), current.valueLength);
      setValue(next, "paste", event);
      const filled = next.filter((entry) => entry.trim() !== "").length;
      moveFocus(Math.min(filled, current.valueLength - 1));
    });
  };

  const reportInvalid = (text: string) => onValueInvalid?.(text, { index: focusedIndex });

  const [focusOnMount] = useState(autoFocus);
  useLayoutEffect(() => {
    if (!focusOnMount) return;
    const first = [...inputsRef.current.entries()].sort(([a], [b]) => a - b)[0]?.[1];
    queueMicrotask(() => first?.focus({ preventScroll: true }));
  }, [focusOnMount]);

  const mountedValue = useRef(valueAsString);
  useEffect(() => {
    if (mountedValue.current === valueAsString) return;
    mountedValue.current = valueAsString;
    dispatchInputValueEvent(hiddenInputRef.current, valueAsString);
  }, [valueAsString]);

  const wasComplete = useRef(complete);
  useEffect(() => {
    if (wasComplete.current === complete) return;
    wasComplete.current = complete;
    if (!complete) return;
    onValueComplete?.(value, { valueAsString });
    if (blurOnComplete) nextFrame(() => inputAt(latest.current.focusedIndex)?.blur());
    if (autoSubmit) hiddenInputRef.current?.form?.requestSubmit();
  });

  const resolvedDisabled = field.disabled;
  const resolvedReadOnly = field.readOnly;
  const resolvedInvalid = field.invalid;
  const resolvedRequired = field.required;
  const inputLabel = translations?.inputLabel ?? defaultInputLabel;
  const step = (key: string) =>
    dir === "rtl" && key === "ArrowLeft"
      ? "ArrowRight"
      : dir === "rtl" && key === "ArrowRight"
        ? "ArrowLeft"
        : key;

  const getInputProps = (index: number) => ({
    id: ids.input(index),
    disabled: resolvedDisabled,
    readOnly: resolvedReadOnly,
    required: resolvedRequired,
    tabIndex: index === tabbableIndex ? 0 : -1,
    "data-disabled": dataAttr(resolvedDisabled),
    "data-complete": dataAttr(complete),
    "data-filled": dataAttr(value[index] !== ""),
    "data-invalid": dataAttr(resolvedInvalid),
    "data-index": index,
    "data-ownedby": rootId,
    "aria-label": inputLabel(index, valueLength),
    "aria-invalid": resolvedInvalid || undefined,
    inputMode: otp || type === "numeric" ? ("numeric" as const) : ("text" as const),
    enterKeyHint: index === valueLength - 1 ? ("done" as const) : ("next" as const),
    type: masked ? "password" : type === "numeric" ? "tel" : "text",
    value: value[index] || "",
    autoCapitalize: "none",
    autoComplete: otp ? "one-time-code" : "off",
    placeholder: focusedIndex === index ? "" : placeholder,
    onPaste(event: ClipboardEvent<HTMLInputElement>) {
      if (resolvedReadOnly) return;
      let pasted = event.clipboardData?.getData("text/plain");
      if (!pasted) return;
      if (sanitizeValue) pasted = sanitizeValue(pasted);
      event.preventDefault();
      if (!isValidValue(pasted, type, pattern)) {
        reportInvalid(pasted);
        return;
      }
      paste(pasted, event.nativeEvent);
    },
    onBeforeInput(event: FormEvent<HTMLInputElement> & { data?: string | null }) {
      const input = event.currentTarget;
      const typed =
        input.value.slice(0, input.selectionStart ?? 0) +
        (event.data ?? "") +
        input.value.slice(input.selectionEnd ?? 0);
      if (!isValidValue(typed, type, pattern)) {
        reportInvalid(typed);
        event.preventDefault();
      }
      // The new character must replace the old one rather than sit beside it.
      if (typed.length > 1) input.setSelectionRange(0, 1, "forward");
    },
    onChange(event: ChangeEvent<HTMLInputElement>) {
      const native = event.nativeEvent as InputEvent;
      const typed = event.currentTarget.value;
      if (resolvedReadOnly || focusedIndex === -1 || native.inputType === "insertFromPaste") return;
      if (typed.length > 2) {
        paste(typed, native);
        return;
      }
      if (native.inputType === "deleteContentBackward") {
        backspace(native);
        return;
      }
      if (native.inputType === "deleteByCut") {
        if (focusedValue !== "") clearFocusedValue(focusedIndex, native);
        return;
      }
      if (typed === focusedValue) return;
      const next = [...value];
      next[focusedIndex] = nextSlotValue(focusedValue, typed);
      setValue(next, "input-change", native);
      moveFocus(Math.min(focusedIndex + 1, valueLength - 1));
    },
    onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.defaultPrevented || isComposingEvent(event) || focusedIndex === -1) return;
      const key = step(event.key);
      const native = event.nativeEvent;

      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        if (key === "ArrowLeft" || key === "ArrowRight") {
          event.preventDefault();
          moveFocus(key === "ArrowLeft" ? 0 : Math.max(filledLength - 1, 0));
          return;
        }
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key.length === 1 && focusedValue === event.key) {
        event.preventDefault();
        moveFocus(Math.min(focusedIndex + 1, valueLength - 1));
        return;
      }

      const lastFilled = Math.max(filledLength - 1, 0);
      const actions: Record<string, () => void> = {
        Backspace: () => {
          if (!resolvedReadOnly) backspace(native);
        },
        Delete: () => {
          if (!resolvedReadOnly && focusedValue !== "") clearFocusedValue(focusedIndex, native);
        },
        ArrowLeft: () => moveFocus(Math.max(focusedIndex - 1, 0)),
        ArrowRight: () =>
          moveFocus(Math.min(focusedIndex + 1, Math.min(filledLength, valueLength - 1))),
        Enter: () => (hiddenInputRef.current?.form ?? inputAt(0)?.form)?.requestSubmit(),
        Home: () => moveFocus(0),
        End: () => moveFocus(lastFilled),
        ArrowUp: () => moveFocus(0),
        ArrowDown: () => moveFocus(lastFilled),
      };
      const action = actions[key];
      if (!action) return;
      action();
      event.preventDefault();
    },
    onFocus() {
      const index_ = Math.min(index, Math.min(filledLength, valueLength - 1));
      if (focusedIndex === -1) {
        setFocusedIndex(index_);
        if (index_ !== index) focusInput(index_);
        if (selectOnFocus) nextFrame(() => inputAt(index_)?.select());
        return;
      }
      moveFocus(index_);
    },
    onBlur(event: FocusEvent<HTMLInputElement>) {
      const target = event.relatedTarget;
      if (target instanceof Element && target.matches(`[data-ownedby~="${CSS.escape(rootId)}"]`)) {
        return;
      }
      setFocusedIndex(-1);
    },
  });

  function backspace(event: Event) {
    if (focusedValue !== "") {
      clearFocusedValue(focusedIndex, event);
      moveFocus(Math.max(focusedIndex - 1, 0));
      return;
    }
    const previous = Math.max(focusedIndex - 1, 0);
    moveFocus(previous);
    clearFocusedValue(previous, event);
  }

  const focusFirst = () => inputAt(0)?.focus();
  const stateAttributes = {
    "data-invalid": dataAttr(resolvedInvalid),
    "data-disabled": dataAttr(resolvedDisabled),
    "data-complete": dataAttr(complete),
    "data-read-only": dataAttr(resolvedReadOnly),
  };

  return {
    rootProps: { id: rootId, ...stateAttributes },
    labelProps: {
      id: ids.label,
      htmlFor: ids.hiddenInput,
      ...stateAttributes,
      "data-required": dataAttr(resolvedRequired),
      onClick(event: MouseEvent<HTMLLabelElement>) {
        event.preventDefault();
        focusFirst();
      },
    },
    controlProps: {
      id: ids.control,
      role: "group",
      "aria-labelledby": field.labelId ?? ids.label,
      "aria-describedby": field.describedBy,
    },
    hiddenInputProps: {
      ref: hiddenInputRef,
      "aria-hidden": true,
      "aria-describedby": field.describedBy,
      type: "text",
      tabIndex: -1,
      id: ids.hiddenInput,
      readOnly: resolvedReadOnly,
      disabled: resolvedDisabled,
      required: resolvedRequired,
      name,
      form,
      minLength: valueLength,
      maxLength: valueLength,
      // `minLength` skips script-set values, so `pattern` is what enforces completeness.
      pattern: `${pattern ? "." : CHAR_PATTERN[type]}{${valueLength}}`,
      defaultValue: valueAsString,
      onFocus() {
        inputAt(tabbableIndex)?.focus();
      },
    },
    getInputProps,
    registerInput,
  };
}

export type PinInputApi = ReturnType<typeof usePinInput>;

const PinInputContext = createContext<PinInputApi | null>(null);

export const PinInputProvider = PinInputContext.Provider;

export function usePinInputContext(part: string): PinInputApi {
  const context = useContext(PinInputContext);
  if (!context) throw new Error(`${part} must be placed inside <PinInput.Root>.`);
  return context;
}
