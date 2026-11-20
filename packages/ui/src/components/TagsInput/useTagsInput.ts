import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { isComposingEvent } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { useLiveRegion } from "../../hooks/useLiveRegion";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import {
  dispatchInputValueEvent,
  useFieldControlState,
  useFormControl,
} from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr } from "../../primitives/render";
import { autoresizeInput } from "./autoresizeInput";

export type TagsInputValueChangeReason =
  | "add"
  | "paste"
  | "edit"
  | "delete"
  | "clear"
  | "form-reset";

/** Why `onValueChange` was called, and a way to keep the tags as they are. */
export type TagsInputValueChangeDetails = ChangeDetails<TagsInputValueChangeReason>;

export type TagsInputInputValueChangeReason = "input-change" | "add" | "clear" | "blur";

/** Why `onInputValueChange` was called, and a way to keep the typed text as it is. */
export type TagsInputInputValueChangeDetails = ChangeDetails<TagsInputInputValueChangeReason>;

/** `"rangeOverflow"`: more tags than `max`. `"invalidTag"`: `validate` refused a tag. */
export type TagsInputInvalidReason = "rangeOverflow" | "invalidTag";

export interface TagsInputTranslations {
  clearTriggerLabel?: string | undefined;
  deleteTagTriggerLabel?: ((value: string) => string) | undefined;
  tagSelected?: ((value: string) => string) | undefined;
  tagAdded?: ((value: string) => string) | undefined;
  tagsPasted?: ((values: string[]) => string) | undefined;
  tagEdited?: ((value: string) => string) | undefined;
  tagUpdated?: ((value: string) => string) | undefined;
  tagDeleted?: ((value: string) => string) | undefined;
  noTagsSelected?: string | undefined;
}

const defaultTranslations: Required<TagsInputTranslations> = {
  clearTriggerLabel: "Clear all tags",
  deleteTagTriggerLabel: (value) => `Delete tag ${value}`,
  tagAdded: (value) => `Added tag ${value}`,
  tagsPasted: (values) => `Pasted ${values.length} tags`,
  tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,
  tagUpdated: (value) => `Tag update to ${value}`,
  tagDeleted: (value) => `Tag ${value} deleted`,
  tagSelected: (value) =>
    `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`,
  noTagsSelected: "No tags selected",
};

export interface TagsInputOptions {
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[], details: TagsInputValueChangeDetails) => void) | undefined;
  /** The text typed into the input, not yet a tag. */
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  onInputValueChange?:
    | ((inputValue: string, details: TagsInputInputValueChangeDetails) => void)
    | undefined;
  /** Called with the value of the tag that keyboard or pointer highlights, or `null`. */
  onHighlightChange?: ((highlightedValue: string | null) => void) | undefined;
  /** Called when there are more tags than `max`, or `validate` refuses one. */
  onValueInvalid?: ((reason: TagsInputInvalidReason) => void) | undefined;
  /** Whether a typed tag can be added. */
  validate?: ((details: { inputValue: string; value: string[] }) => boolean) | undefined;
  /** Cleans a tag before it's added. @default (value) => value.trim() */
  sanitizeValue?: ((value: string) => string) | undefined;
  /** @default false */
  allowDuplicates?: boolean | undefined;
  /** The most tags the input adds. @default Infinity */
  max?: number | undefined;
  /** Lets typed tags go past `max`, marking the input invalid. */
  allowOverflow?: boolean | undefined;
  /** The text that ends a typed tag and splits a pasted one. @default "," */
  delimiter?: string | RegExp | undefined;
  /** Adds the tags in pasted text. @default false */
  addOnPaste?: boolean | undefined;
  /** What leaving the input does with its text: add it as a tag, or clear it. */
  blurBehavior?: "clear" | "add" | undefined;
  /** Whether Enter or a double click edits a tag. @default true */
  editable?: boolean | undefined;
  /** The longest text the input and a tag's edit input take. */
  maxLength?: number | undefined;
  /** Shown in the input while there are no tags. */
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  translations?: TagsInputTranslations | undefined;
  /** The name the hidden input submits the tags under, joined by `", "`. */
  name?: string | undefined;
  form?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** Prefixes the ids of the parts. */
  id?: string | undefined;
}

type Mode = "idle" | "input" | "navigating" | "editing";

type Log =
  | { type: "add" | "update" | "delete" | "select"; value: string }
  | { type: "clear" }
  | { type: "paste"; values: string[] };

const isEqual = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);

const uniq = (values: string[]) => [...new Set(values)];

function trimTrailingDelimiter(value: string, delimiter: string | RegExp | undefined) {
  if (!delimiter) return undefined;
  if (typeof delimiter === "string") {
    return value.endsWith(delimiter) ? value.slice(0, -delimiter.length) : undefined;
  }
  const match = new RegExp(`(?:${delimiter.source})$`, delimiter.flags.replace(/[gy]/g, "")).exec(
    value,
  );
  return match?.[0] ? value.slice(0, match.index) : undefined;
}

function isCaretAtStart(input: HTMLInputElement | null) {
  if (!input) return false;
  try {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  } catch {
    return input.value === "";
  }
}

const trim = (value: string) => value.trim();
const acceptAll = () => true;

export function useTagsInput({
  value: valueProp,
  defaultValue = [],
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue = "",
  onInputValueChange,
  onHighlightChange,
  onValueInvalid,
  validate = acceptAll,
  sanitizeValue = trim,
  allowDuplicates = false,
  max = Infinity,
  allowOverflow = false,
  delimiter = ",",
  addOnPaste = false,
  blurBehavior,
  editable = true,
  maxLength,
  placeholder,
  autoFocus = false,
  translations: translationsProp,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  id: idProp,
}: TagsInputOptions) {
  const uid = useId();
  const id = idProp ?? uid;
  const { dir } = useLocale();
  const field = useFieldControlState({ disabled, readOnly, invalid, required });
  const translations = { ...defaultTranslations, ...translationsProp };

  const ids = {
    root: `tags-input:${id}`,
    label: `tags-input:${id}:label`,
    control: `tags-input:${id}:control`,
    input: field.id ?? `tags-input:${id}:input`,
    hiddenInput: `tags-input:${id}:hidden-input`,
    clearTrigger: `tags-input:${id}:clear-btn`,
    item: (value: string, index: number) => `tags-input:${id}:tag:${value}:${index}`,
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const itemElements = useRef(new Set<HTMLElement>());
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValueState] = useControllableState({ value: valueProp, defaultValue });
  const [inputValue, setInputValueState] = useControllableState({
    value: inputValueProp,
    defaultValue: defaultInputValue,
  });
  const [mode, setModeState] = useState<Mode>("idle");
  const [highlightedIndex, setHighlightedState] = useState<number | null>(null);
  // Outside presses and root presses run in one event, so they read state set moments earlier.
  const current = useRef({ mode, highlightedIndex });
  const setMode = (next: Mode) => {
    current.current.mode = next;
    setModeState(next);
  };
  const setHighlightedIndex = (next: number | null) => {
    current.current.highlightedIndex = next;
    setHighlightedState(next);
  };
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState("");
  const [deleteIntent, setDeleteIntent] = useState<number | null>(null);

  const { fieldsetDisabled } = useFormControl(hiddenInputRef, () =>
    setValue(initialValue, "form-reset"),
  );
  const resolvedDisabled = field.disabled || fieldsetDisabled;
  const resolvedReadOnly = field.readOnly;
  const interactive = !(resolvedDisabled || resolvedReadOnly);
  const overflowing = value.length > max;
  const resolvedInvalid = field.invalid || overflowing;
  const empty = value.length === 0;
  const atMax = value.length === max;
  const valueAsString = value.join(", ");
  const focused = mode !== "idle";

  const latest = useLatestRef({ value, inputValue });

  const frames = useRef(new Map<string, number>());
  const requestFrame = useCallback((key: string, callback: () => void) => {
    const pending = frames.current;
    cancelAnimationFrame(pending.get(key) ?? 0);
    pending.set(
      key,
      requestAnimationFrame(() => {
        pending.delete(key);
        callback();
      }),
    );
  }, []);
  const cancelFrame = (key: string) => {
    cancelAnimationFrame(frames.current.get(key) ?? 0);
    frames.current.delete(key);
  };
  useEffect(() => {
    const pending = frames.current;
    return () => pending.forEach(cancelAnimationFrame);
  }, []);

  const [focusOnMount] = useState(autoFocus);
  useEffect(() => {
    if (focusOnMount) requestFrame("focus-input", () => inputRef.current?.focus());
  }, [focusOnMount, requestFrame]);

  const [liveRegion, announceMessage] = useLiveRegion("assertive");

  const log = useRef<{ current: Log | null; prev: Log | null }>({ current: null, prev: null });
  const announce = (entry: Log) => {
    log.current = { prev: log.current.current, current: entry };
    const { prev } = log.current;
    let message: string | undefined;
    if (entry.type === "add") message = translations.tagAdded(entry.value);
    else if (entry.type === "delete") message = translations.tagDeleted(entry.value);
    else if (entry.type === "update") message = translations.tagUpdated(entry.value);
    else if (entry.type === "paste") message = translations.tagsPasted(entry.values);
    else if (entry.type === "clear") message = translations.noTagsSelected;
    else if (entry.type === "select") {
      message = translations.tagSelected(entry.value);
      if (prev?.type === "delete") message = `${translations.tagDeleted(prev.value)}. ${message}`;
      else if (prev?.type === "update")
        message = `${translations.tagUpdated(prev.value)}. ${message}`;
    }
    if (message) announceMessage(message);
  };

  function setValue(next: string[], reason: TagsInputValueChangeReason, event?: Event) {
    if (isEqual(next, latest.current.value)) return true;
    const details = createChangeDetails(reason, event);
    onValueChange?.(next, details);
    if (details.canceled) return false;
    setValueState(next);
    return true;
  }

  function setInputValue(next: string, reason: TagsInputInputValueChangeReason, event?: Event) {
    if (next === latest.current.inputValue) return;
    const details = createChangeDetails(reason, event);
    onInputValueChange?.(next, details);
    if (!details.canceled) setInputValueState(next);
  }

  const highlightedValue = highlightedIndex === null ? null : (value[highlightedIndex] ?? null);
  const highlightKey = highlightedIndex === null ? null : `${highlightedIndex}:${highlightedValue}`;
  const reportedHighlight = useRef(highlightKey);
  useEffect(() => {
    if (reportedHighlight.current === highlightKey) return;
    reportedHighlight.current = highlightKey;
    onHighlightChange?.(highlightedValue);
    if (highlightedValue !== null && log.current.current) {
      announce({ type: "select", value: highlightedValue });
    }
  });

  const wasOverflowing = useRef(overflowing);
  useEffect(() => {
    if (wasOverflowing.current === overflowing) return;
    wasOverflowing.current = overflowing;
    if (overflowing) onValueInvalid?.("rangeOverflow");
  });

  const mountedValue = useRef(valueAsString);
  useEffect(() => {
    if (mountedValue.current === valueAsString) return;
    mountedValue.current = valueAsString;
    queueMicrotask(() => dispatchInputValueEvent(hiddenInputRef.current, valueAsString));
  }, [valueAsString]);

  const focusInput = () => requestFrame("focus-input", () => inputRef.current?.focus());

  const leaveTagModes = () => {
    cancelFrame("highlight");
    cancelFrame("focus-input");
  };

  const enterInput = () => {
    if (current.current.mode === "input" || current.current.mode === "navigating") leaveTagModes();
    setMode("input");
    setHighlightedIndex(null);
    focusInput();
  };

  const highlightAtIndex = (index: number) =>
    requestFrame("highlight", () => {
      if (index < latest.current.value.length) setHighlightedIndex(index);
      else enterInput();
    });

  const enterNavigating = () => {
    if (current.current.mode === "input" || current.current.mode === "navigating") leaveTagModes();
    setMode("navigating");
    setEditingIndex(null);
  };

  const addTag = (raw: string, event?: Event) => {
    const tag = sanitizeValue(raw);
    const tags = latest.current.value;
    if (!validate({ inputValue: tag, value: [...tags] })) {
      onValueInvalid?.("invalidTag");
      return true;
    }
    const next = allowDuplicates ? [...tags, tag] : uniq([...tags, tag]);
    const applied = setValue(next, "add", event);
    if (applied) announce({ type: "add", value: tag });
    return applied;
  };

  const insertTag = (raw: string, event?: Event) => {
    if (atMax && !allowOverflow) return;
    if (sanitizeValue(raw).length === 0) return;
    if (addTag(raw, event)) setInputValue("", "add", event);
  };

  const deleteAt = (index: number, event?: Event) => {
    const tags = latest.current.value;
    if (index < 0 || index >= tags.length) return;
    const removed = tags[index];
    if (
      setValue(
        tags.filter((_, at) => at !== index),
        "delete",
        event,
      )
    ) {
      announce({ type: "delete", value: removed });
    }
  };

  const applyBlurBehavior = (event?: Event) => {
    if (blurBehavior === "add") insertTag(latest.current.inputValue, event);
    else if (blurBehavior === "clear") setInputValue("", "blur", event);
  };

  const blur = (event: Event) => {
    if (current.current.mode === "input") {
      applyBlurBehavior(event);
      setMode("idle");
      leaveTagModes();
    } else if (current.current.mode === "navigating") {
      setMode("idle");
      setHighlightedIndex(null);
      leaveTagModes();
    }
  };

  const latestBlur = useLatestRef(blur);
  useEffect(() => {
    if (mode !== "input" && mode !== "navigating") return;
    const input = inputRef.current;
    if (!input) return;
    const doc = input.ownerDocument;
    const isInside = (target: EventTarget | null) =>
      target instanceof Node &&
      (input.contains(target) || [...itemElements.current].some((item) => item.contains(target)));
    const handle = (event: Event) => {
      if (!isInside(event.target)) latestBlur.current(event);
    };
    doc.addEventListener("pointerdown", handle, true);
    doc.addEventListener("focusin", handle, true);
    return () => {
      doc.removeEventListener("pointerdown", handle, true);
      doc.removeEventListener("focusin", handle, true);
    };
  }, [mode, latestBlur]);

  const editTag = (index: number) => {
    setMode("editing");
    setEditingIndex(index);
    setEditedValue(latest.current.value[index] ?? "");
    requestFrame("edit", () => {
      const tag = latest.current.value[index];
      if (tag === undefined) return;
      const input = document.getElementById(`${ids.item(tag, index)}:input`);
      if (!(input instanceof HTMLInputElement)) return;
      input.focus();
      input.select();
    });
  };

  const finishEditing = () => {
    setEditingIndex(null);
    setEditedValue("");
  };

  const editingTag = editingIndex === null ? undefined : value[editingIndex];
  const editingInputId =
    mode === "editing" && editable && editingTag !== undefined && editingIndex !== null
      ? `${ids.item(editingTag, editingIndex)}:input`
      : null;
  useEffect(() => {
    const input = editingInputId && document.getElementById(editingInputId);
    if (input instanceof HTMLInputElement) return autoresizeInput(input);
  }, [editingInputId]);

  const arrowKey = (key: string) =>
    dir === "rtl" && key === "ArrowLeft"
      ? "ArrowRight"
      : dir === "rtl" && key === "ArrowRight"
        ? "ArrowLeft"
        : key;

  const lastIndex = value.length - 1;

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || isComposingEvent(event)) return;
    const target = event.currentTarget;
    const combobox = target.getAttribute("role") === "combobox";
    const expanded = target.getAttribute("aria-expanded") === "true";
    const native = event.nativeEvent;
    const caretAtStart = isCaretAtStart(target);
    const hasTags = value.length > 0;

    switch (arrowKey(event.key)) {
      case "ArrowDown":
        if (mode === "navigating") enterInput();
        return;
      case "ArrowLeft":
        if (combobox && expanded) return;
        if (mode === "input") {
          if (hasTags && caretAtStart) {
            enterNavigating();
            setHighlightedIndex(lastIndex);
          }
        } else if (mode === "navigating") {
          if (!caretAtStart) enterInput();
          else if (highlightedIndex !== null)
            setHighlightedIndex(Math.max(0, highlightedIndex - 1));
        }
        return;
      case "ArrowRight":
        if (highlightedIndex !== null) event.preventDefault();
        if (combobox && expanded) return;
        if (mode !== "navigating") return;
        if (hasTags && caretAtStart && highlightedIndex !== lastIndex) {
          if (highlightedIndex !== null) {
            setHighlightedIndex(Math.min(highlightedIndex + 1, lastIndex));
          }
        } else {
          enterInput();
        }
        return;
      case "Escape":
        // An Escape left unprevented closes the dialog or popover around the field.
        if (mode !== "navigating") return;
        event.preventDefault();
        enterInput();
        return;
      case "Backspace":
        if (mode === "input") {
          if (hasTags && caretAtStart) {
            enterNavigating();
            setHighlightedIndex(lastIndex);
          }
        } else if (mode === "navigating") {
          if (!caretAtStart) enterInput();
          else if (highlightedIndex === 0) {
            deleteAt(0, native);
            highlightAtIndex(0);
          } else if (highlightedIndex !== null) {
            deleteAt(highlightedIndex, native);
            setHighlightedIndex(Math.max(0, highlightedIndex - 1));
          } else {
            setHighlightedIndex(lastIndex >= 0 ? lastIndex : null);
          }
        }
        return;
      case "Delete":
        if (mode !== "navigating") return;
        if (!caretAtStart || highlightedIndex === null) {
          enterInput();
          return;
        }
        event.preventDefault();
        deleteAt(highlightedIndex, native);
        highlightAtIndex(highlightedIndex);
        return;
      case "Enter": {
        if (combobox && expanded && target.getAttribute("aria-activedescendant")) return;
        event.preventDefault();
        if (mode === "input") insertTag(inputValue, native);
        else if (mode === "navigating" && editable && highlightedIndex !== null) {
          editTag(highlightedIndex);
        }
        return;
      }
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const native = event.nativeEvent as InputEvent;
    const typed = event.currentTarget.value;
    const fromTags = mode === "navigating";

    if (native.inputType === "insertFromPaste") {
      if (fromTags) enterInput();
      setInputValue(typed, "input-change", native);
      if (addOnPaste && mode !== "idle") {
        requestFrame("paste", () => {
          const pasted = sanitizeValue(typed);
          const existing = latest.current.value;
          if (validate({ inputValue: pasted, value: [...existing] })) {
            const tags = (delimiter ? pasted.split(delimiter).map(sanitizeValue) : [pasted]).filter(
              (tag) => tag.length > 0,
            );
            const fresh = allowDuplicates
              ? tags
              : uniq(tags).filter((tag) => !existing.includes(tag));
            const added = allowOverflow
              ? fresh
              : fresh.slice(0, Math.max(0, max - existing.length));
            if (added.length > 0 && setValue([...existing, ...added], "paste", native)) {
              announce({ type: "paste", values: added });
            }
          } else {
            onValueInvalid?.("invalidTag");
          }
          setInputValue("", "add", native);
        });
      }
      return;
    }

    const beforeDelimiter = trimTrailingDelimiter(typed, delimiter);
    if (fromTags) enterInput();
    setInputValue(beforeDelimiter ?? typed, "input-change", native);
    if (beforeDelimiter !== undefined && mode !== "idle") insertTag(beforeDelimiter, native);
  };

  const getItemState = (index: number, itemDisabled: boolean | undefined) => ({
    editing: mode === "editing" && editingIndex === index,
    highlighted: highlightedIndex === index,
    disabled: !!itemDisabled || resolvedDisabled,
  });

  const getItemParts = (tag: string, index: number, itemDisabled: boolean | undefined) => {
    const state = getItemState(index, itemDisabled);
    const itemId = ids.item(tag, index);
    const highlightedAttribute = dataAttr(state.highlighted);

    return {
      state,
      itemProps: { "data-value": tag, "data-disabled": dataAttr(resolvedDisabled) },
      previewProps: {
        id: itemId,
        hidden: state.editing,
        "data-value": tag,
        "data-disabled": dataAttr(resolvedDisabled),
        "data-highlighted": highlightedAttribute,
        "data-delete-intent": dataAttr(deleteIntent === index),
        onPointerDown(event: PointerEvent<HTMLElement>) {
          if (!interactive || state.disabled || event.button !== 0) return;
          event.preventDefault();
          enterNavigating();
          setHighlightedIndex(index);
          focusInput();
        },
        onDoubleClick() {
          if (!interactive || state.disabled || !editable) return;
          editTag(index);
        },
      },
      textProps: {
        "data-disabled": dataAttr(resolvedDisabled),
        "data-highlighted": highlightedAttribute,
      },
      inputProps: {
        id: `${itemId}:input`,
        "aria-label": translations.tagEdited(tag),
        disabled: resolvedDisabled,
        tabIndex: -1,
        hidden: !state.editing,
        maxLength,
        value: state.editing ? editedValue : "",
        onChange(event: ChangeEvent<HTMLInputElement>) {
          setEditedValue(event.currentTarget.value);
        },
        onBlur(event: FocusEvent<HTMLInputElement>) {
          const related = event.relatedTarget;
          const native = event.nativeEvent;
          queueMicrotask(() => {
            if (current.current.mode !== "editing") return;
            finishEditing();
            setHighlightedIndex(null);
            if (related === inputRef.current) {
              setMode("navigating");
              return;
            }
            setMode("idle");
            applyBlurBehavior(native);
          });
        },
        onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
          if (event.defaultPrevented || isComposingEvent(event)) return;
          if (event.key !== "Enter" && event.key !== "Escape") return;
          event.preventDefault();
          const native = event.nativeEvent;
          if (event.key === "Enter") {
            if (sanitizeValue(editedValue) === "") {
              deleteAt(index, native);
            } else {
              const tags = latest.current.value;
              const duplicate = tags.some((entry, at) => at !== index && entry === editedValue);
              if ((allowDuplicates || !duplicate) && tags[index] !== editedValue) {
                const next = [...tags];
                next[index] = editedValue;
                if (setValue(next, "edit", native)) {
                  announce({ type: "update", value: editedValue });
                }
              }
            }
          }
          setMode("navigating");
          finishEditing();
          focusInput();
          highlightAtIndex(index);
        },
      },
      deleteTriggerProps: {
        id: `${itemId}:delete-btn`,
        type: "button" as const,
        disabled: state.disabled,
        tabIndex: -1,
        "aria-label": translations.deleteTagTriggerLabel(tag),
        "aria-disabled": state.disabled,
        "data-disabled": dataAttr(state.disabled),
        "data-highlighted": highlightedAttribute,
        onPointerDown(event: PointerEvent<HTMLButtonElement>) {
          if (event.button === 0 && !interactive) event.preventDefault();
        },
        onPointerMove() {
          if (interactive) setDeleteIntent(index);
        },
        onPointerLeave() {
          if (interactive) setDeleteIntent(null);
        },
        onClick(event: MouseEvent<HTMLButtonElement>) {
          if (event.defaultPrevented || !interactive) return;
          enterInput();
          deleteAt(index, event.nativeEvent);
        },
      },
    };
  };

  const registerItem = useCallback((element: HTMLElement) => {
    itemElements.current.add(element);
    return () => {
      itemElements.current.delete(element);
    };
  }, []);

  const stateAttributes = {
    "data-invalid": dataAttr(resolvedInvalid),
    "data-read-only": dataAttr(resolvedReadOnly),
    "data-disabled": dataAttr(resolvedDisabled),
  };

  return {
    value,
    getItemParts,
    registerItem,
    liveRegion: interactive ? liveRegion : null,
    rootProps: {
      id: ids.root,
      ...stateAttributes,
      "data-focus": dataAttr(focused),
      "data-empty": dataAttr(empty),
      onPointerDown() {
        if (!interactive) return;
        if (current.current.mode === "idle" && current.current.highlightedIndex === null) {
          enterInput();
        }
      },
    },
    labelProps: {
      id: ids.label,
      htmlFor: ids.input,
      "data-disabled": dataAttr(resolvedDisabled),
      "data-invalid": dataAttr(resolvedInvalid),
      "data-read-only": dataAttr(resolvedReadOnly),
      "data-required": dataAttr(field.required),
    },
    controlProps: {
      id: ids.control,
      tabIndex: resolvedReadOnly ? 0 : undefined,
      ...stateAttributes,
      "data-focus": dataAttr(focused),
    },
    inputProps: {
      ref: inputRef,
      id: ids.input,
      value: inputValue,
      maxLength,
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      enterKeyHint: "done" as const,
      disabled: resolvedDisabled || resolvedReadOnly,
      placeholder: empty ? placeholder : undefined,
      "aria-invalid": resolvedInvalid || undefined,
      "aria-describedby": field.describedBy,
      "data-invalid": dataAttr(resolvedInvalid),
      "data-read-only": dataAttr(resolvedReadOnly),
      "data-empty": dataAttr(empty),
      onChange: onInputChange,
      onKeyDown: onInputKeyDown,
      onFocus() {
        queueMicrotask(() => {
          if (current.current.mode === "idle") enterInput();
        });
      },
    },
    hiddenInputProps: {
      ref: hiddenInputRef,
      type: "text",
      hidden: true,
      id: ids.hiddenInput,
      name,
      form,
      disabled: resolvedDisabled,
      readOnly: resolvedReadOnly,
      required: field.required,
      defaultValue: valueAsString,
      "aria-describedby": field.describedBy,
    },
    clearTriggerProps: {
      id: ids.clearTrigger,
      type: "button" as const,
      disabled: resolvedDisabled,
      hidden: empty,
      "aria-label": translations.clearTriggerLabel,
      "data-read-only": dataAttr(resolvedReadOnly),
      onClick(event: MouseEvent<HTMLButtonElement>) {
        if (!interactive) return;
        if (setValue([], "clear", event.nativeEvent)) announce({ type: "clear" });
        setInputValue("", "clear", event.nativeEvent);
        focusInput();
      },
    },
  };
}

export type TagsInputApi = ReturnType<typeof useTagsInput>;

const TagsInputContext = createContext<TagsInputApi | null>(null);

export const TagsInputProvider = TagsInputContext.Provider;

export function useTagsInputContext(part: string): TagsInputApi {
  const context = useContext(TagsInputContext);
  if (!context) throw new Error(`${part} must be placed inside <TagsInput.Root>.`);
  return context;
}
