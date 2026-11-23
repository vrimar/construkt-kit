import { sameItems } from "@construkt-kit/utils";
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { isComposingEvent } from "../../foundations/dom";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { useControllableState } from "../../hooks/useControllableState";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useFrameQueue } from "../../hooks/useFrameQueue";
import { useLatestRef } from "../../hooks/useLatestRef";
import { useRenderedParts } from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { type NavigableList, getTargetIndex, mirrorArrowKey } from "../../primitives/composite";
import {
  hiddenFormInputProps,
  useFormFieldState,
  useHiddenInputValue,
} from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr, fieldStateAttributes } from "../../primitives/render";
import { createPartContext } from "../partContext";
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

/** Every `TagsInputOptions` key, to split them off the root's props. */
export const TAGS_INPUT_OPTION_KEYS = {
  value: true,
  defaultValue: true,
  onValueChange: true,
  inputValue: true,
  defaultInputValue: true,
  onInputValueChange: true,
  onHighlightChange: true,
  onValueInvalid: true,
  validate: true,
  sanitizeValue: true,
  allowDuplicates: true,
  max: true,
  allowOverflow: true,
  delimiter: true,
  addOnPaste: true,
  blurBehavior: true,
  editable: true,
  maxLength: true,
  placeholder: true,
  autoFocus: true,
  translations: true,
  name: true,
  form: true,
  disabled: true,
  readOnly: true,
  invalid: true,
  required: true,
  id: true,
} as const satisfies Record<keyof TagsInputOptions, true>;

type Mode = "idle" | "input" | "navigating" | "editing";

type Log =
  | { type: "add" | "update" | "delete" | "select"; value: string }
  | { type: "clear"; removed: string[]; emptied: boolean }
  | { type: "paste"; values: string[] };

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
  const translations = { ...defaultTranslations, ...translationsProp };

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const itemElements = useRef(new Set<HTMLElement>());
  const [disabledItems, setDisabledItems] = useState<ReadonlySet<number>>(() => new Set());
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

  const [rendered, reportRendered] = useRenderedParts<"input">();
  const field = useFormFieldState(
    { disabled, readOnly, invalid, required },
    {
      elementRef: rootRef,
      onReset: () => setValue(initialValue, "form-reset"),
      input: () => hiddenInputRef.current,
    },
  );
  const ids = {
    root: `tags-input:${id}`,
    label: `tags-input:${id}:label`,
    control: `tags-input:${id}:control`,
    input: `tags-input:${id}:input`,
    hiddenInput: `tags-input:${id}:hidden-input`,
    clearTrigger: `tags-input:${id}:clear-btn`,
    item: (tag: string, index: number) => `tags-input:${id}:tag:${tag}:${index}`,
  };
  const resolvedDisabled = field.disabled;
  const resolvedReadOnly = field.readOnly;
  const interactive = !(resolvedDisabled || resolvedReadOnly);
  const overflowing = value.length > max;
  const resolvedInvalid = field.invalid || overflowing;
  const empty = value.length === 0;
  const valueAsString = value.join(", ");
  const focused = mode !== "idle";

  const latest = useLatestRef({ value, inputValue });

  const frames = useFrameQueue();
  useFocusOnMount(autoFocus, () => inputRef.current?.focus());

  const { liveRegion, announce: announceMessage } = useAnnouncer({ politeness: "assertive" });

  const log = useRef<{ current: Log | null; prev: Log | null }>({ current: null, prev: null });
  const announce = (entry: Log) => {
    log.current = { prev: log.current.current, current: entry };
    const { prev } = log.current;
    let message: string | undefined;
    if (entry.type === "add") message = translations.tagAdded(entry.value);
    else if (entry.type === "delete") message = translations.tagDeleted(entry.value);
    else if (entry.type === "update") message = translations.tagUpdated(entry.value);
    else if (entry.type === "paste") message = translations.tagsPasted(entry.values);
    else if (entry.type === "clear") {
      message = entry.emptied
        ? translations.noTagsSelected
        : entry.removed.map((tag) => translations.tagDeleted(tag)).join(". ");
    } else if (entry.type === "select") {
      message = translations.tagSelected(entry.value);
      if (prev?.type === "delete") message = `${translations.tagDeleted(prev.value)}. ${message}`;
      else if (prev?.type === "update")
        message = `${translations.tagUpdated(prev.value)}. ${message}`;
    }
    if (message) announceMessage(message);
  };

  function setValue(next: string[], reason: TagsInputValueChangeReason, event?: Event) {
    if (sameItems(next, latest.current.value)) return true;
    if (!emitChange(onValueChange, next, reason, event)) return false;
    setValueState(next);
    return true;
  }

  function setInputValue(next: string, reason: TagsInputInputValueChangeReason, event?: Event) {
    if (next === latest.current.inputValue) return;
    if (emitChange(onInputValueChange, next, reason, event)) setInputValueState(next);
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

  useHiddenInputValue(() => hiddenInputRef.current, valueAsString);

  const focusInput = () => frames.request("focus-input", () => inputRef.current?.focus());

  const leaveTagModes = () => {
    frames.cancel("highlight");
    frames.cancel("focus-input");
  };

  const enterInput = () => {
    if (current.current.mode === "input" || current.current.mode === "navigating") leaveTagModes();
    setMode("input");
    setHighlightedIndex(null);
    focusInput();
  };

  const highlightAtIndex = (index: number) =>
    frames.request("highlight", () => {
      if (index < latest.current.value.length) setHighlightedIndex(index);
      else enterInput();
    });

  const enterNavigating = () => {
    if (current.current.mode === "input" || current.current.mode === "navigating") leaveTagModes();
    setMode("navigating");
    setEditingIndex(null);
  };

  const appendTags = (raw: readonly string[], reason: "add" | "paste", event?: Event) => {
    const existing = latest.current.value;
    const room = allowOverflow ? Infinity : max - existing.length;
    const tags = raw.map(sanitizeValue).filter((tag) => tag.length > 0);
    if (room <= 0 || tags.length === 0) return false;
    const valid = tags.filter((tag) => validate({ inputValue: tag, value: [...existing] }));
    if (valid.length < tags.length) onValueInvalid?.("invalidTag");
    if (valid.length === 0) return false;
    const fresh = allowDuplicates ? valid : uniq(valid).filter((tag) => !existing.includes(tag));
    const added = fresh.slice(0, room);
    if (added.length === 0) return true;
    if (!setValue([...existing, ...added], reason, event)) return false;
    announce(
      reason === "paste" ? { type: "paste", values: added } : { type: "add", value: added[0] },
    );
    return true;
  };

  const insertTag = (raw: string, event?: Event) => {
    if (appendTags([raw], "add", event)) setInputValue("", "add", event);
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
    frames.request("edit", () => {
      const input = editInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    });
  };

  const attachEditInput = useCallback((input: HTMLInputElement | null) => {
    if (!input) return;
    editInputRef.current = input;
    const stopResizing = autoresizeInput(input);
    return () => {
      stopResizing();
      if (editInputRef.current === input) editInputRef.current = null;
    };
  }, []);

  const finishEditing = () => {
    setEditingIndex(null);
    setEditedValue("");
  };

  const saveEdit = (index: number, event: Event) => {
    const tags = latest.current.value;
    const edited = sanitizeValue(editedValue);
    if (edited === "") {
      deleteAt(index, event);
      return true;
    }
    if (edited === tags[index]) return true;
    const others = tags.filter((_, at) => at !== index);
    if (!validate({ inputValue: edited, value: others })) {
      onValueInvalid?.("invalidTag");
      return false;
    }
    if (!allowDuplicates && others.includes(edited)) return true;
    const next = [...tags];
    next[index] = edited;
    if (setValue(next, "edit", event)) announce({ type: "update", value: edited });
    return true;
  };

  const isItemDisabled = (index: number) => disabledItems.has(index);
  const keptOnClear = value.filter((_, index) => isItemDisabled(index));
  const removedOnClear = value.filter((_, index) => !isItemDisabled(index));

  const lastIndex = value.length - 1;
  const tagList: NavigableList = { length: value.length, isDisabled: () => false };
  const stepFrom = (index: number, target: "prev" | "next") =>
    getTargetIndex(tagList, index, target, false);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || isComposingEvent(event)) return;
    const target = event.currentTarget;
    const native = event.nativeEvent;
    const caretAtStart = isCaretAtStart(target);
    const hasTags = value.length > 0;

    switch (mirrorArrowKey(event.key, dir === "rtl")) {
      case "ArrowDown":
        if (mode === "navigating") enterInput();
        return;
      case "ArrowLeft":
        if (mode === "input") {
          if (hasTags && caretAtStart) {
            enterNavigating();
            setHighlightedIndex(lastIndex);
          }
        } else if (mode === "navigating") {
          if (!caretAtStart) enterInput();
          else if (highlightedIndex !== null)
            setHighlightedIndex(stepFrom(highlightedIndex, "prev"));
        }
        return;
      case "ArrowRight":
        if (highlightedIndex !== null) event.preventDefault();
        if (mode !== "navigating") return;
        if (hasTags && caretAtStart && highlightedIndex !== lastIndex) {
          if (highlightedIndex !== null) setHighlightedIndex(stepFrom(highlightedIndex, "next"));
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
          else if (highlightedIndex !== null && isItemDisabled(highlightedIndex)) return;
          else if (highlightedIndex === 0) {
            deleteAt(0, native);
            highlightAtIndex(0);
          } else if (highlightedIndex !== null) {
            deleteAt(highlightedIndex, native);
            setHighlightedIndex(stepFrom(highlightedIndex, "prev"));
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
        if (isItemDisabled(highlightedIndex)) return;
        deleteAt(highlightedIndex, native);
        highlightAtIndex(highlightedIndex);
        return;
      case "Enter": {
        event.preventDefault();
        if (mode === "input") insertTag(inputValue, native);
        else if (
          mode === "navigating" &&
          editable &&
          highlightedIndex !== null &&
          !isItemDisabled(highlightedIndex)
        ) {
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
        frames.request("paste", () => {
          const pasted = sanitizeValue(typed);
          appendTags(delimiter ? pasted.split(delimiter) : [pasted], "paste", native);
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
    const disabledAttribute = dataAttr(state.disabled);

    return {
      state,
      itemProps: { "data-value": tag, "data-disabled": disabledAttribute },
      previewProps: {
        id: itemId,
        hidden: state.editing,
        "data-value": tag,
        "data-disabled": disabledAttribute,
        "data-highlighted": highlightedAttribute,
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
        "data-disabled": disabledAttribute,
        "data-highlighted": highlightedAttribute,
      },
      inputProps: {
        ref: state.editing ? attachEditInput : undefined,
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
          if (event.key === "Enter" && !saveEdit(index, event.nativeEvent)) return;
          setMode("navigating");
          finishEditing();
          focusInput();
          highlightAtIndex(index);
        },
      },
      deleteTriggerProps: {
        id: `${itemId}:delete-btn`,
        disabled: state.disabled,
        tabIndex: -1,
        "aria-label": translations.deleteTagTriggerLabel(tag),
        "aria-disabled": state.disabled,
        "data-disabled": disabledAttribute,
        "data-highlighted": highlightedAttribute,
        onPointerDown(event: PointerEvent<HTMLButtonElement>) {
          if (event.button === 0 && !interactive) event.preventDefault();
        },
        onClick(event: MouseEvent<HTMLButtonElement>) {
          if (event.defaultPrevented || !interactive) return;
          enterInput();
          deleteAt(index, event.nativeEvent);
        },
      },
    };
  };

  const registerItem = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    itemElements.current.add(element);
    return () => {
      itemElements.current.delete(element);
    };
  }, []);

  const registerDisabledItem = useCallback((index: number) => {
    setDisabledItems((indexes) => new Set(indexes).add(index));
    return () => {
      setDisabledItems((indexes) => {
        const next = new Set(indexes);
        next.delete(index);
        return next;
      });
    };
  }, []);

  const stateAttributes = fieldStateAttributes({
    disabled: resolvedDisabled,
    invalid: resolvedInvalid,
    readOnly: resolvedReadOnly,
  });

  return {
    value,
    getItemParts,
    registerItem,
    registerDisabledItem,
    liveRegion: interactive ? liveRegion : null,
    reportRendered,
    rootProps: {
      ref: rootRef,
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
      htmlFor: rendered.input,
      ...fieldStateAttributes({
        disabled: resolvedDisabled,
        invalid: resolvedInvalid,
        readOnly: resolvedReadOnly,
        required: field.required,
      }),
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
      ...hiddenFormInputProps,
      ref: hiddenInputRef,
      type: "text",
      id: ids.hiddenInput,
      name,
      form,
      disabled: resolvedDisabled,
      readOnly: resolvedReadOnly,
      required: field.required,
      defaultValue: valueAsString,
      onFocus() {
        inputRef.current?.focus();
      },
    },
    clearTriggerProps: {
      id: ids.clearTrigger,
      disabled: resolvedDisabled,
      hidden: removedOnClear.length === 0,
      "aria-label": translations.clearTriggerLabel,
      "data-read-only": dataAttr(resolvedReadOnly),
      onClick(event: MouseEvent<HTMLButtonElement>) {
        if (!interactive) return;
        if (setValue(keptOnClear, "clear", event.nativeEvent)) {
          announce({ type: "clear", removed: removedOnClear, emptied: keptOnClear.length === 0 });
        }
        setInputValue("", "clear", event.nativeEvent);
        focusInput();
      },
    },
  };
}

export type TagsInputApi = ReturnType<typeof useTagsInput>;

export const [TagsInputContext, useTagsInputContext] =
  createPartContext<TagsInputApi>("<TagsInput.Root>");

export const TagsInputProvider = TagsInputContext.Provider;
