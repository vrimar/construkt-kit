import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type ElementType,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Box, createSlotRecipeContext, splitCssProps } from "#styled-system/jsx";
import { type ComboboxVariantProps, combobox } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type DismissReason,
  type OpenChangeDetails,
  type OpenChangeReason,
  useOpenState,
  useOverlayExit,
} from "../../primitives/layer";
import type { PlacementOption } from "../../primitives/position";
import { type TransitionStatus, presenceAttributes } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useStore } from "../../primitives/store";
import { useFieldControl } from "../fieldTrigger";
import { createAnchoredPositioner, useAnchoredPopup } from "../floating";
import {
  ListboxNode,
  sameEntries,
  selectHighlighted,
  selectIsHighlighted,
} from "../Listbox/listboxNode";
import { encodeSelectionValue } from "../Listbox/managed";
import type { SelectionMode, SelectionValue } from "../Listbox/types";
import {
  type MobileLayoutProps,
  OverlayPresentationContext,
  useOverlayMode,
  useOverlayPresentation,
} from "../overlayPresentation";
import type { StyledRootProps } from "../rootProps";
import { type SheetCloseReason, SheetOverlayContent } from "../sheetFrame";
import { Announcer, type AnnouncerProps } from "./Announcer";

const { withProvider, withContext } = createSlotRecipeContext(combobox);

export type ComboboxInputValueChangeReason =
  | "input-change"
  | "item-select"
  | "clear-trigger"
  | "revert";

export interface ComboboxInputValueChangeDetails {
  reason: ComboboxInputValueChangeReason;
}

interface ComboboxSingleSelectionProps<V extends SelectionValue> {
  selectionMode?: "single" | undefined;
  value?: V | null | undefined;
  defaultValue?: V | null | undefined;
  onValueChange?: ((value: V | null) => void) | undefined;
}

interface ComboboxMultipleSelectionProps<V extends SelectionValue> {
  selectionMode: "multiple";
  value?: readonly V[] | undefined;
  defaultValue?: readonly V[] | undefined;
  onValueChange?: ((value: V[]) => void) | undefined;
}

interface ComboboxSelectionPropsByMode<V extends SelectionValue> {
  single: ComboboxSingleSelectionProps<V>;
  multiple: ComboboxMultipleSelectionProps<V>;
}

interface ComboboxRootOwnProps<T, V extends SelectionValue> extends MobileLayoutProps {
  /** The options to show; filter them yourself from `onInputValueChange`. */
  items: readonly T[];
  /** Compared by identity, as are `getItemLabel` and `isItemDisabled`: a new one re-reads every item. */
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: ((item: T) => boolean) | undefined;
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  onInputValueChange?:
    | ((inputValue: string, details: ComboboxInputValueChangeDetails) => void)
    | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The value of the highlighted option, or `null` for none. */
  highlightedValue?: V | null | undefined;
  defaultHighlightedValue?: V | null | undefined;
  onHighlightChange?: ((value: V | null) => void) | undefined;
  /**
   * `autohighlight` highlights the first option as you type; `autocomplete` also fills the input
   * with the option the arrow keys reach. @default "none"
   */
  inputBehavior?: "none" | "autohighlight" | "autocomplete" | undefined;
  /**
   * What the input shows once an option is picked: its label (`replace`), nothing (`clear`) or the
   * typed text (`preserve`). @default "replace", or "clear" with `selectionMode="multiple"`
   */
  selectionBehavior?: "replace" | "clear" | "preserve" | undefined;
  /** Opens the list when the input is clicked. @default false */
  openOnClick?: boolean | undefined;
  /** Opens the list as you type, or when this returns true for the typed text. @default true */
  openOnChange?: boolean | ((inputValue: string) => boolean) | undefined;
  /** Opens the list with the arrow keys. @default true */
  openOnKeyPress?: boolean | undefined;
  /** @default true, or false with `selectionMode="multiple"` */
  closeOnSelect?: boolean | undefined;
  /** Keeps typed text that matches no option when the list closes. @default false */
  allowCustomValue?: boolean | undefined;
  /** Lets Enter submit the form even while an option is highlighted. @default false */
  alwaysSubmitOnEnter?: boolean | undefined;
  /** Arrow keys wrap from the last option to the first and back. @default true */
  loopFocus?: boolean | undefined;
  /** Focuses the input on mount. */
  autoFocus?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  /** Announces that results are loading instead of how many there are. */
  loading?: boolean | undefined;
  /** Where the list opens against the control. @default "bottom" */
  placement?: PlacementOption | undefined;
}

type OwnKey = keyof ComboboxRootOwnProps<unknown, SelectionValue>;

export type ComboboxRootBaseProps<T, V extends SelectionValue> = StyledRootProps<
  Record<OwnKey | "selectionMode" | "value" | "defaultValue" | "onValueChange", unknown>
> &
  ComboboxVariantProps &
  ComboboxRootOwnProps<T, V> & { ref?: Ref<HTMLDivElement> | undefined };

export type ComboboxRootProps<
  T = unknown,
  V extends SelectionValue = SelectionValue,
  M extends SelectionMode = "single",
> = ComboboxRootBaseProps<T, V> & ComboboxSelectionPropsByMode<V>[M];

type ComboboxRootImplProps<T, V extends SelectionValue> = Omit<
  ComboboxRootBaseProps<T, V>,
  keyof ComboboxVariantProps
> &
  ComboboxSelectionPropsByMode<V>[SelectionMode];

interface ComboboxContextValue {
  node: ListboxNode;
  ids: {
    root: string;
    label: string;
    control: string;
    input: string;
    content: string;
    trigger: string;
    clearTrigger: string;
  };
  open: boolean;
  focused: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  name: string | undefined;
  form: string | undefined;
  describedBy: string | undefined;
  multiple: boolean;
  inputValue: string;
  /** The text the input shows: the input value, or an option's label while autocomplete fills it in. */
  displayValue: string;
  autoComplete: boolean;
  hasValue: boolean;
  empty: boolean;
  loading: boolean;
  placement: PlacementOption;
  valueOf: (item: unknown) => string;
  isItemDisabled: (item: unknown) => boolean;
  isSelected: (value: string) => boolean;
  controlEl: HTMLElement | null;
  setControlEl: (element: HTMLElement | null) => void;
  setInputEl: (element: HTMLElement | null) => void;
  triggerEl: HTMLElement | null;
  setTriggerEl: (element: HTMLElement | null) => void;
  setClearTriggerEl: (element: HTMLElement | null) => void;
  contains: (target: Node) => boolean;
  dismiss: (reason: DismissReason | SheetCloseReason, event?: Event) => boolean;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: (event: MouseEvent<HTMLInputElement>) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onTriggerClick: (event: MouseEvent<HTMLElement>) => void;
  onClear: (event: MouseEvent<HTMLElement>) => void;
  onItemPointerMove: (value: string) => void;
  onItemPointerLeave: () => void;
  onItemClick: (value: string, event: MouseEvent<HTMLElement>) => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error("Combobox parts must be rendered inside Combobox.Root.");
  return context;
}

const toArray = <V,>(value: V | readonly V[] | null | undefined): V[] =>
  value == null ? [] : Array.isArray(value) ? [...(value as readonly V[])] : [value as V];

const sameValues = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);

const focusField = (element: HTMLElement | null) => {
  if (!element) return;
  if (element.ownerDocument.activeElement !== element) element.focus({ preventScroll: true });
  if (element instanceof HTMLInputElement) {
    element.setSelectionRange(element.value.length, element.value.length);
  }
};

const selectionText = (behavior: string, labels: string, input: string) =>
  behavior === "preserve" ? input : behavior === "replace" ? labels : "";

function RootElement<T, V extends SelectionValue>({
  ref,
  render,
  items,
  getItemValue,
  getItemLabel,
  isItemDisabled,
  selectionMode = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue = "",
  onInputValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  mobileLayout,
  highlightedValue: highlightedProp,
  defaultHighlightedValue = null,
  onHighlightChange,
  inputBehavior = "none",
  selectionBehavior: selectionBehaviorProp,
  openOnClick = false,
  openOnChange = true,
  openOnKeyPress = true,
  closeOnSelect: closeOnSelectProp,
  allowCustomValue = false,
  alwaysSubmitOnEnter = false,
  loopFocus = true,
  autoFocus = false,
  disabled: disabledProp,
  readOnly: readOnlyProp,
  invalid: invalidProp,
  required: requiredProp,
  name,
  form,
  loading = false,
  placement = "bottom",
  children,
  ...rest
}: ComboboxRootImplProps<T, V>) {
  const field = useFieldControl();
  const id = useId();
  const multiple = selectionMode === "multiple";
  const selectionBehavior = selectionBehaviorProp ?? (multiple ? "clear" : "replace");
  const closeOnSelect = closeOnSelectProp ?? !multiple;
  const autoComplete = inputBehavior === "autocomplete" && !multiple;
  const autoHighlight = inputBehavior === "autohighlight";
  const disabled = disabledProp ?? field?.disabled ?? false;
  const readOnly = readOnlyProp ?? field?.readOnly ?? false;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const required = requiredProp ?? field?.required ?? false;
  const interactive = !disabled && !readOnly;

  const [node] = useState(
    () =>
      new ListboxNode(
        `combobox:${id}`,
        (highlightedProp ?? defaultHighlightedValue) == null
          ? null
          : encodeSelectionValue((highlightedProp ?? defaultHighlightedValue) as V),
      ),
  );

  const { entries, values } = useMemo(() => {
    const byValue = new Map<string, V>();
    const list = items.map((item) => {
      const native = getItemValue(item);
      const encoded = encodeSelectionValue(native);
      byValue.set(encoded, native);
      return {
        value: encoded,
        label: getItemLabel(item),
        disabled: isItemDisabled?.(item) ?? false,
      };
    });
    return { entries: list, values: byValue };
  }, [items, getItemValue, getItemLabel, isItemDisabled]);

  const [localValue, setLocalValue] = useState<V[]>(() => toArray(defaultValue));
  const selectedValues = valueProp !== undefined ? toArray(valueProp) : localValue;
  const selected = useMemo(() => selectedValues.map(encodeSelectionValue), [selectedValues]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const labelCache = useRef(new Map<string, string>());
  useLayoutEffect(() => {
    for (const entry of entries) {
      if (selectedSet.has(entry.value)) labelCache.current.set(entry.value, entry.label);
    }
  }, [entries, selectedSet]);

  const labelsOf = (encoded: readonly string[]) =>
    encoded
      .map(
        (entry) =>
          entries.find((candidate) => candidate.value === entry)?.label ??
          labelCache.current.get(entry),
      )
      .filter((label): label is string => label != null)
      .join(", ");

  const [initialInputValue] = useState(() => {
    if (defaultInputValue.trim() || multiple) return defaultInputValue;
    const labels = selected
      .map((entry) => entries.find((candidate) => candidate.value === entry)?.label)
      .filter(Boolean)
      .join(", ");
    return selectionText(selectionBehavior, labels, defaultInputValue);
  });
  const [inputValue, setInputState] = useControllableState({
    value: inputValueProp,
    defaultValue: initialInputValue,
  });
  const [autofill, setAutofill] = useState<string | null>(null);

  const setInputValue = (next: string, reason: ComboboxInputValueChangeReason) => {
    setAutofill(null);
    if (next === inputValue) return;
    setInputState(next);
    onInputValueChange?.(next, { reason });
  };

  const { open, requestOpenChange } = useOpenState({ open: openProp, defaultOpen, onOpenChange });
  const presentation = useOverlayPresentation({ mobileLayout, open });
  if (!open && autofill !== null) setAutofill(null);
  const [focused, setFocused] = useState(false);
  const initiallySuggesting = defaultOpen || openProp === true;
  const suggestingRef = useRef(initiallySuggesting);
  const [suggesting, setSuggesting] = useState(initiallySuggesting);
  const setMode = (next: boolean) => {
    suggestingRef.current = next;
    setSuggesting(next);
  };

  const [controlEl, setControlEl] = useState<HTMLElement | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLElement | null>(null);
  const clearTriggerRef = useRef<HTMLElement | null>(null);
  const setInputEl = useCallback(
    (element: HTMLElement | null) => {
      inputRef.current = element;
      node.setInput(element);
    },
    [node],
  );
  const setClearTriggerEl = useCallback((element: HTMLElement | null) => {
    clearTriggerRef.current = element;
  }, []);

  const frames = useRef({ focus: 0, highlight: 0 });
  useEffect(() => {
    const pending = frames.current;
    return () => {
      cancelAnimationFrame(pending.focus);
      cancelAnimationFrame(pending.highlight);
    };
  }, []);

  const focusInput = () => {
    cancelAnimationFrame(frames.current.focus);
    frames.current.focus = requestAnimationFrame(() => focusField(inputRef.current));
  };

  const focusFinal = () => {
    if (presentation.mode === "sheet") return;
    cancelAnimationFrame(frames.current.focus);
    frames.current.focus = requestAnimationFrame(() => focusField(inputRef.current));
  };

  const highlightLater = (pick: () => string | null | undefined) => {
    cancelAnimationFrame(frames.current.highlight);
    frames.current.highlight = requestAnimationFrame(() => {
      const value = pick();
      if (value) node.highlight(value, true);
    });
  };

  const firstSelected = () => entries.find((entry) => selectedSet.has(entry.value))?.value;

  const openList = (
    reason: OpenChangeReason,
    event: Event | undefined,
    {
      suggest = false,
      highlight,
    }: { suggest?: boolean; highlight?: () => string | null | undefined } = {},
  ) => {
    if (!requestOpenChange(true, reason, event)) return false;
    setMode(suggest);
    if (highlight) highlightLater(highlight);
    return true;
  };

  const closeList = (
    reason: OpenChangeReason,
    event: Event | undefined,
    { refocus = true }: { refocus?: boolean } = {},
  ) => {
    if (!requestOpenChange(false, reason, event)) return false;
    if (refocus) focusFinal();
    return true;
  };

  const valueText = () => labelsOf(selected);
  const isCustomValue = () => inputValue !== valueText();

  const revertedInputValue = () =>
    selectionBehavior === "replace"
      ? valueText()
      : selectionBehavior === "preserve"
        ? inputValue
        : "";
  const revertInputValue = () => setInputValue(revertedInputValue(), "revert");

  const commitValue = (next: string[]) => {
    if (sameValues(next, selected)) return;
    const decoded = next
      .map(
        (entry) =>
          values.get(entry) ?? selectedValues.find((own) => encodeSelectionValue(own) === entry),
      )
      .filter((entry): entry is V => entry !== undefined);
    if (valueProp === undefined) setLocalValue(decoded);
    if (multiple) (onValueChange as ((value: V[]) => void) | undefined)?.(decoded);
    else (onValueChange as ((value: V | null) => void) | undefined)?.(decoded[0] ?? null);
  };

  const selectValue = (picked: string) => {
    const next = multiple
      ? selectedSet.has(picked)
        ? selected.filter((entry) => entry !== picked)
        : [...selected, picked]
      : [picked];
    commitValue(next);
    setInputValue(selectionText(selectionBehavior, labelsOf(next), inputValue), "item-select");
  };

  const pick = (value: string, event: Event) => {
    if (!interactive) return;
    selectValue(value);
    if (closeOnSelect) closeList("item-press", event);
  };

  const selectedKey = selected.join("\n");
  const syncedKey = useRef(selectedKey);
  const syncInputToValue = useLatestRef(() => {
    if (selectionBehavior === "preserve") return;
    setInputValue(selectionText(selectionBehavior, labelsOf(selected), inputValue), "item-select");
  });
  useEffect(() => {
    if (syncedKey.current === selectedKey) return;
    syncedKey.current = selectedKey;
    queueMicrotask(() => syncInputToValue.current());
  }, [selectedKey, syncInputToValue]);

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (open) {
      const input = inputRef.current;
      // Refocusing moves the caret to the end, away from where the user is typing.
      if (input?.ownerDocument.activeElement !== input) focusInput();
      return;
    }
    cancelAnimationFrame(frames.current.highlight);
    node.reset();
    node.scrollToTop();
  });

  const [focusOnMount] = useState(autoFocus);
  useEffect(() => {
    if (!focusOnMount) return;
    const frame = requestAnimationFrame(() => focusField(inputRef.current));
    return () => cancelAnimationFrame(frame);
  }, [focusOnMount]);

  const highlightControlled = highlightedProp !== undefined;
  useLayoutEffect(() => {
    if (highlightControlled) {
      node.syncHighlight(highlightedProp == null ? null : encodeSelectionValue(highlightedProp));
    }
  }, [node, highlightControlled, highlightedProp]);

  const decodeHighlight = (encoded: string | null) =>
    encoded == null ? null : (values.get(encoded) ?? null);

  useLayoutEffect(() => {
    node.update({
      entries,
      disabled,
      loopFocus,
      typeahead: false,
      alwaysShowHighlight: true,
      scrollToIndex: undefined,
      onPick: (value, _modifiers, event) => pick(value, event),
      onNavigate: undefined,
      onSelectAll: undefined,
      onHighlightChange:
        onHighlightChange && ((value) => onHighlightChange(decodeHighlight(value))),
      highlightControlled,
    });
  });

  const prevEntries = useRef(entries);
  useLayoutEffect(() => {
    if (sameEntries(prevEntries.current, entries)) return;
    prevEntries.current = entries;
    if (!open) return;
    const highlighted = node.highlighted;
    const removed = highlighted != null && !entries.some((entry) => entry.value === highlighted);
    if (autoHighlight && entries.length > 0 && (removed || suggestingRef.current)) {
      queueMicrotask(() => node.highlight(node.firstEnabled(), true));
    } else if (!removed && highlighted != null && !suggestingRef.current) {
      queueMicrotask(() => node.scrollTo(highlighted));
    }
  });

  const moveHighlight = (target: "next" | "prev") => {
    const highlighted = node.highlighted;
    if (autoComplete && highlighted != null) {
      const edge = target === "next" ? node.lastEnabled() : node.firstEnabled();
      if (highlighted === edge) {
        node.highlight(null);
        setAutofill(null);
        if (target === "next") node.scrollToTop();
        return;
      }
    }
    const value = node.move(target);
    if (autoComplete && value != null) {
      setAutofill(entries.find((entry) => entry.value === value)?.label ?? null);
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || !interactive || isComposingEvent(event)) return;
    if ((event.ctrlKey || event.shiftKey) && event.key !== "Enter") return;
    const native = event.nativeEvent;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (!openOnKeyPress && !open) return;
        event.preventDefault();
        const down = event.key === "ArrowDown";
        if (event.altKey) {
          if (down) openList("list-navigation", native);
          else closeList("list-navigation", native);
          return;
        }
        if (!open) {
          const edge = () => firstSelected() ?? (down ? node.firstEnabled() : node.lastEnabled());
          openList("list-navigation", native, autoComplete ? {} : { highlight: edge });
          return;
        }
        setMode(false);
        moveHighlight(down ? "next" : "prev");
        return;
      }
      case "Enter": {
        const highlighted = node.highlighted;
        const rejected = isCustomValue() && !allowCustomValue;
        if (open && !alwaysSubmitOnEnter && (highlighted != null || rejected)) {
          event.preventDefault();
        }
        if (!open) return;
        if (highlighted == null) {
          if (rejected) {
            revertInputValue();
            closeList("item-press", native, { refocus: false });
          } else if (closeOnSelect) {
            closeList("item-press", native);
          }
          return;
        }
        const item = node.elementOf(highlighted);
        if (item?.matches("a[href]")) {
          event.preventDefault();
          queueMicrotask(() => item.click());
          return;
        }
        pick(highlighted, native);
        return;
      }
      case "Escape":
        if (open || !isCustomValue() || allowCustomValue) return;
        // An Escape left unprevented closes the dialog or popover around the field.
        if (revertedInputValue() === inputValue) return;
        event.preventDefault();
        revertInputValue();
        return;
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value;
    const native = event.nativeEvent;
    if (!open) {
      const opens = typeof openOnChange === "function" ? openOnChange(next) : openOnChange;
      setInputValue(next, "input-change");
      if (opens) {
        openList("input-change", native, {
          suggest: true,
          highlight: autoHighlight ? () => node.firstEnabled() : undefined,
        });
      }
      return;
    }
    if (!suggestingRef.current && !autoComplete) node.highlight(null);
    setMode(true);
    setInputValue(next, "input-change");
    node.scrollToTop();
  };

  const onTriggerClick = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || !interactive || event.button !== 0) return;
    if (open) {
      closeList("trigger-press", event.nativeEvent, { refocus: false });
      return;
    }
    if (openList("trigger-press", event.nativeEvent, { highlight: firstSelected })) focusInput();
  };

  const onInputClick = (event: MouseEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || !openOnClick || !interactive || open) return;
    openList("trigger-press", event.nativeEvent, { highlight: firstSelected });
  };

  const onClear = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || !interactive) return;
    commitValue([]);
    setInputValue(selectionBehavior === "preserve" ? inputValue : "", "clear-trigger");
    if (open) closeList("close-press", event.nativeEvent);
    else focusInput();
  };

  const contains = (target: Node) =>
    [controlEl, inputRef.current, triggerEl, clearTriggerRef.current].some(
      (element) => element?.contains(target) ?? false,
    );

  const dismiss = (reason: DismissReason | SheetCloseReason, event?: Event) => {
    if (reason === "escape-key") {
      setAutofill(null);
      return closeList("escape-key", event, { refocus: !suggestingRef.current && !autoComplete });
    }
    if (reason === "close-press") return closeList("close-press", event);
    if (isCustomValue() && !allowCustomValue) revertInputValue();
    return closeList(reason, event, { refocus: false });
  };

  const ids = {
    root: `combobox:${id}`,
    label: field?.labelId ?? `combobox:${id}:label`,
    control: `combobox:${id}:control`,
    input: field?.id ?? `combobox:${id}:input`,
    content: `combobox:${id}:content`,
    trigger: `combobox:${id}:toggle-btn`,
    clearTrigger: `combobox:${id}:clear-btn`,
  };

  const context: ComboboxContextValue = {
    node,
    ids,
    open,
    focused: focused || open,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    form,
    describedBy: field?.describedBy,
    multiple,
    inputValue,
    displayValue: autofill ?? inputValue,
    autoComplete,
    hasValue: selected.length > 0,
    empty: entries.length === 0,
    loading,
    placement,
    valueOf: (item) => encodeSelectionValue(getItemValue(item as T)),
    isItemDisabled: (item) => isItemDisabled?.(item as T) ?? false,
    isSelected: (value) => selectedSet.has(value),
    controlEl,
    setControlEl,
    setInputEl,
    triggerEl,
    setTriggerEl,
    setClearTriggerEl,
    contains,
    dismiss,
    onInputChange,
    onInputKeyDown,
    onInputClick,
    onInputFocus: () => setFocused(true),
    onInputBlur: () => setFocused(false),
    onTriggerClick,
    onClear,
    onItemPointerMove: (value) => {
      setMode(false);
      node.highlight(value);
    },
    onItemPointerLeave: () => node.highlight(null),
    onItemClick: (value, event) => node.pick(value, event.nativeEvent),
  };

  return (
    <OverlayPresentationContext value={presentation}>
      <ComboboxContext value={context}>
        <renderable.div
          ref={ref}
          render={render}
          id={ids.root}
          data-invalid={invalid ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          {...(rest as ComponentProps<"div">)}
        >
          <SheetInputHostProvider>
            {children}
            {open && (
              <ComboboxAnnouncer
                node={node}
                entries={entries}
                inputValue={inputValue}
                loading={loading}
                suggesting={suggesting}
                isSelected={context.isSelected}
              />
            )}
          </SheetInputHostProvider>
        </renderable.div>
      </ComboboxContext>
    </OverlayPresentationContext>
  );
}

const StyledRoot: ElementType = withProvider(RootElement as ElementType, "root");

interface ComboboxRootComponent {
  <T, V extends SelectionValue>(props: ComboboxRootProps<T, V>): JSX.Element;
  <T, V extends SelectionValue>(props: ComboboxRootProps<T, V, "multiple">): JSX.Element;
}

const Root = StyledRoot as ComboboxRootComponent;

interface SheetInputHost {
  host: HTMLElement | null;
  setHost: (host: HTMLElement | null) => void;
}

const SheetInputHostContext = createContext<SheetInputHost>({ host: null, setHost: () => {} });

function SheetInputHostProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ host, setHost }), [host]);
  return <SheetInputHostContext value={value}>{children}</SheetInputHostContext>;
}

function ComboboxAnnouncer(props: AnnouncerProps) {
  const { host } = useContext(SheetInputHostContext);
  if (useOverlayMode() !== "sheet") return <Announcer {...props} />;
  // The modal sheet makes everything outside it inert, live regions included.
  return host && createPortal(<Announcer {...props} />, host);
}

const StyledLabel = withContext(renderable.label, "label");
const StyledControl = withContext(renderable.div, "control");
const StyledInput = withContext(renderable.input, "input");
const ProxyTrigger = withContext(renderable.button, "input");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledClearTrigger = withContext(renderable.button, "clearTrigger");
const IndicatorGroup = withContext(renderable.div, "indicatorGroup");
const StyledContent = withContext(renderable.div, "content");
const Positioner = createAnchoredPositioner(withContext(renderable.div, "positioner"));
const StyledList = withContext(renderable.div, "list");
const StyledEmpty = withContext(renderable.div, "empty");
const StyledItem = withContext(renderable.div, "item");
const StyledItemText = withContext(renderable.span, "itemText");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator");
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const StyledItemGroupLabel = withContext(renderable.div, "itemGroupLabel");

function Label(props: ComponentProps<typeof StyledLabel>) {
  const context = useComboboxContext();
  return (
    <StyledLabel
      id={context.ids.label}
      htmlFor={context.ids.input}
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      data-required={context.required ? "" : undefined}
      {...props}
    />
  );
}

function Control({ ref, ...props }: ComponentProps<typeof StyledControl>) {
  const context = useComboboxContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setControlEl);
  return (
    <StyledControl
      id={context.ids.control}
      data-focus={context.focused ? "" : undefined}
      data-disabled={context.disabled ? "" : undefined}
      data-invalid={context.invalid ? "" : undefined}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
    />
  );
}

type InputProps = ComponentProps<typeof StyledInput>;

function useInputProps(): InputProps {
  const context = useComboboxContext();
  const { node } = context;
  const highlighted = useStore(node.store, selectHighlighted);
  const props: Record<string, unknown> = {
    id: context.ids.input,
    type: "text",
    role: "combobox",
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "none",
    spellCheck: false,
    name: context.name,
    form: context.form,
    disabled: context.disabled,
    required: context.required,
    readOnly: context.readOnly,
    value: context.displayValue,
    "aria-invalid": context.invalid || undefined,
    "aria-describedby": context.describedBy,
    "aria-autocomplete": context.autoComplete ? "both" : "list",
    "aria-controls": context.ids.content,
    "aria-expanded": context.open,
    "aria-activedescendant": highlighted == null ? undefined : node.itemId(highlighted),
    "data-invalid": context.invalid ? "" : undefined,
    ...openStateAttributes(context.open),
    onChange: context.onInputChange,
    onKeyDown: context.onInputKeyDown,
    onClick: context.onInputClick,
    onFocus: () => {
      if (!context.disabled) context.onInputFocus();
    },
    onBlur: () => {
      if (!context.disabled) context.onInputBlur();
    },
  };
  return props as InputProps;
}

function InputElement({ ref, ...props }: InputProps) {
  const context = useComboboxContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setInputEl);
  return (
    <StyledInput
      {...mergeProps<InputProps>(useInputProps(), props)}
      ref={composedRef}
    />
  );
}

const isFieldAttribute = (key: string) => key.startsWith("aria-") || key.startsWith("data-");

function SheetInputProxy(props: InputProps) {
  const context = useComboboxContext();
  const proxyRef = useRef<HTMLButtonElement>(null);
  const keyboardHolderRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(proxyRef, context.setTriggerEl);
  const [styleProps, { className, ...inputProps }] = splitCssProps(props);
  const fieldAttributes = Object.fromEntries(
    Object.entries(inputProps).filter(([key]) => isFieldAttribute(key)),
  );
  const { placeholder } = props;
  const name = props.name ?? context.name;
  const form = props.form ?? context.form;
  const disabled = props.disabled ?? context.disabled;
  const readOnly = props.readOnly ?? context.readOnly;
  const required = props.required ?? context.required;
  const valueId = `${context.ids.trigger}-value`;
  // A self-reference names the button by its own aria-label, followed by the value.
  const labelledBy =
    props["aria-labelledby"] ??
    (props["aria-label"] == null ? context.ids.label : context.ids.trigger);

  return (
    <>
      <ProxyTrigger
        ref={composedRef}
        type="button"
        id={context.ids.trigger}
        aria-haspopup="listbox"
        aria-expanded={context.open}
        aria-controls={context.open ? context.ids.content : undefined}
        disabled={disabled}
        textAlign="start"
        {...openStateAttributes(context.open)}
        aria-invalid={context.invalid || undefined}
        aria-describedby={context.describedBy}
        data-invalid={context.invalid ? "" : undefined}
        {...styleProps}
        className={className}
        {...fieldAttributes}
        aria-labelledby={`${labelledBy} ${valueId}`}
        color={context.inputValue ? styleProps.color : "fg.subtle"}
        onFocus={() => context.onInputFocus()}
        onBlur={() => context.onInputBlur()}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          // iOS only raises the keyboard for focus inside a tap; it stays up for the sheet's input.
          if (!readOnly) keyboardHolderRef.current?.focus({ preventScroll: true });
          context.onTriggerClick(event);
        }}
      >
        <span id={valueId}>{context.inputValue || placeholder}</span>
      </ProxyTrigger>
      <input
        ref={keyboardHolderRef}
        aria-hidden
        tabIndex={-1}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 1,
          height: 0,
          opacity: 0,
          fontSize: 16,
        }}
      />
      {(name != null || required) && (
        // Submits and validates like the desktop input; a hidden-type input can't be required.
        <input
          aria-hidden
          tabIndex={-1}
          name={name}
          form={form}
          disabled={disabled}
          required={required && !readOnly}
          value={context.inputValue}
          onChange={() => {}}
          onFocus={() => proxyRef.current?.focus()}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

function ComboboxInput(props: InputProps) {
  const sheetInput = useContext(SheetInputHostContext);
  const [, inputProps] = splitCssProps(props);

  if (useOverlayMode() !== "sheet") return <InputElement {...props} />;

  return (
    <>
      <SheetInputProxy {...props} />
      {sheetInput.host != null &&
        createPortal(
          <InputElement
            {...inputProps}
            name={undefined}
            form={undefined}
          />,
          sheetInput.host,
        )}
    </>
  );
}

function TriggerElement({
  ref,
  onClick,
  onPointerDown,
  children,
  ...props
}: ComponentProps<typeof StyledTrigger>) {
  const context = useComboboxContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setTriggerEl);
  return (
    <StyledTrigger
      type="button"
      id={context.ids.trigger}
      tabIndex={-1}
      aria-label="Toggle suggestions"
      aria-haspopup="listbox"
      aria-expanded={context.open}
      aria-controls={context.open ? context.ids.content : undefined}
      disabled={context.disabled}
      data-invalid={context.invalid ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      data-disabled={context.disabled ? "" : undefined}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (context.disabled || context.readOnly) return;
        if (event.pointerType === "touch" || event.button !== 0) return;
        event.preventDefault();
        queueMicrotask(() => focusField(context.node.input));
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        context.onTriggerClick(event);
      }}
    >
      {children ?? <ChevronsUpDownIcon />}
    </StyledTrigger>
  );
}

// The field's proxy is the trigger in a phone sheet; a second trigger would duplicate its id.
function Trigger(props: ComponentProps<typeof StyledTrigger>) {
  if (useOverlayMode() === "sheet") return null;
  return <TriggerElement {...props} />;
}

function ClearTrigger({
  ref,
  onClick,
  onPointerDown,
  children,
  ...props
}: ComponentProps<typeof StyledClearTrigger>) {
  const context = useComboboxContext();
  const composedRef = useComposedRefs(
    ref as Ref<HTMLElement> | undefined,
    context.setClearTriggerEl,
  );
  return (
    <StyledClearTrigger
      type="button"
      id={context.ids.clearTrigger}
      tabIndex={-1}
      aria-label="Clear selection"
      aria-controls={context.ids.input}
      disabled={context.disabled}
      hidden={!context.hasValue}
      data-invalid={context.invalid ? "" : undefined}
      {...props}
      ref={composedRef}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (event.button === 0) event.preventDefault();
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        context.onClear(event);
      }}
    >
      {children ?? <XIcon />}
    </StyledClearTrigger>
  );
}

type ContentElementProps = ComponentProps<typeof StyledContent> & {
  status?: TransitionStatus;
};

function ContentElement({ ref, status, onPointerDown, ...props }: ContentElementProps) {
  const context = useComboboxContext();
  const setContent = useCallback(
    (element: HTMLElement | null) => {
      context.node.setContent(element);
      return () => context.node.setContent(null);
    },
    [context.node],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, setContent);
  return (
    <StyledContent
      id={context.ids.content}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={context.ids.label}
      aria-multiselectable={context.multiple || undefined}
      aria-busy={context.loading || undefined}
      data-empty={context.empty ? "" : undefined}
      {...presenceAttributes(status)}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (event.button === 0) event.preventDefault();
      }}
    />
  );
}

export type ComboboxContentProps = ComponentProps<typeof StyledContent>;

function AnchoredContent({ ref, ...props }: ComboboxContentProps) {
  const context = useComboboxContext();
  const { open } = context;
  const popup = useAnchoredPopup({
    open,
    placement: context.placement,
    anchor: context.controlEl ?? context.triggerEl,
    trigger: context.triggerEl,
    contains: context.contains,
    dismiss: context.dismiss,
  });
  const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, popup.setElement);
  useOverlayExit(open, !popup.mounted);

  if (!popup.mounted) return null;

  return (
    <Positioner popup={popup}>
      <ContentElement
        data-side={popup.side}
        data-align={popup.align}
        status={popup.status}
        {...props}
        ref={elementRef}
      />
    </Positioner>
  );
}

function SheetContent(props: ComboboxContentProps) {
  const context = useComboboxContext();
  const { setHost } = useContext(SheetInputHostContext);
  const api = {
    open: context.open,
    dismiss: context.dismiss,
    restoreFocus: true,
    returnFocusTo: () => context.triggerEl,
    label: { "aria-labelledby": context.ids.label },
  };

  return (
    <SheetOverlayContent
      {...(props as Record<string, unknown>)}
      api={api}
      Content={ContentElement}
      fullHeight
      header={
        <Box
          ref={setHost}
          px="4"
          pb="2"
        />
      }
    />
  );
}

function Content(props: ComboboxContentProps) {
  if (useOverlayMode() === "sheet") return <SheetContent {...props} />;
  return <AnchoredContent {...props} />;
}

function List(props: ComponentProps<typeof StyledList>) {
  const { empty } = useComboboxContext();
  return (
    <StyledList
      data-empty={empty ? "" : undefined}
      {...props}
    />
  );
}

function Empty(props: ComponentProps<typeof StyledEmpty>) {
  const { empty } = useComboboxContext();
  if (!empty) return null;
  return (
    <StyledEmpty
      {...props}
      role="presentation"
    />
  );
}

const ItemSelectedContext = createContext(false);

export interface ComboboxItemProps extends ComponentProps<typeof StyledItem> {
  /** One of the root's `items`. */
  item: unknown;
  /** Keeps the option highlighted when the pointer leaves it. */
  persistFocus?: boolean | undefined;
}

function Item({
  ref,
  item,
  persistFocus = false,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: ComboboxItemProps) {
  const context = useComboboxContext();
  const { node } = context;
  const value = context.valueOf(item);
  const highlighted = useStore(node.store, selectIsHighlighted, value);
  const selected = context.isSelected(value);
  const disabled = context.disabled || context.isItemDisabled(item);
  const register = useCallback(
    (element: HTMLElement | null) => (element ? node.registerItem(value, element) : undefined),
    [node, value],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);

  return (
    <ItemSelectedContext value={selected}>
      <StyledItem
        id={node.itemId(value)}
        role="option"
        tabIndex={-1}
        data-value={value}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-selected={selected ? "" : undefined}
        data-highlighted={highlighted ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
        ref={composedRef}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          onPointerMove?.(event);
          if (disabled || highlighted) return;
          context.onItemPointerMove(value);
        }}
        onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(event);
          if (persistFocus || disabled) return;
          context.onItemPointerLeave();
        }}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled || event.button !== 0) return;
          context.onItemClick(value, event);
        }}
      />
    </ItemSelectedContext>
  );
}

function ItemIndicator({ children, ...props }: ComponentProps<typeof StyledItemIndicator>) {
  const selected = useContext(ItemSelectedContext);
  return (
    <StyledItemIndicator
      aria-hidden
      {...(selected ? { "data-checked": "" } : { "data-unchecked": "" })}
      {...props}
    >
      {children ?? <CheckIcon />}
    </StyledItemIndicator>
  );
}

const GroupLabelIdContext = createContext<string | undefined>(undefined);

function ItemGroup({ id, ...props }: ComponentProps<typeof StyledItemGroup>) {
  const generated = useId();
  const groupId = id ?? `combobox-group:${generated}`;
  const labelId = `${groupId}:label`;
  return (
    <GroupLabelIdContext value={labelId}>
      <StyledItemGroup
        id={groupId}
        role="group"
        aria-labelledby={labelId}
        {...props}
      />
    </GroupLabelIdContext>
  );
}

function ItemGroupLabel(props: ComponentProps<typeof StyledItemGroupLabel>) {
  return (
    <StyledItemGroupLabel
      id={useContext(GroupLabelIdContext)}
      role="presentation"
      {...props}
    />
  );
}

export const Combobox = {
  Root,
  ClearTrigger,
  Content,
  Control,
  Empty,
  IndicatorGroup,
  Input: ComboboxInput,
  Item,
  ItemGroup,
  ItemGroupLabel,
  ItemIndicator,
  ItemText: StyledItemText,
  Label,
  List,
  Trigger,
};
