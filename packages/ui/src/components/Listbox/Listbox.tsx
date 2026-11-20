import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
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

import {
  HStack,
  type HTMLStyledProps,
  VisuallyHidden,
  createSlotRecipeContext,
} from "#styled-system/jsx";
import { type ListboxVariantProps, listbox } from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import { isEditableTarget } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useStore } from "../../primitives/store";
import type { CssProp, Unstyled } from "../../types";
import { EmptyState } from "../EmptyState";
import { SearchInput, type SearchInputProps } from "../Input";
import { useItemSlotIds } from "../itemSlots";
import type { StyledRootProps } from "../rootProps";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";
import { type ScrollToIndexRef, VirtualRows, useScrollToIndexRef } from "../ScrollArea/VirtualRows";
import {
  type ListEntry,
  ListboxNode,
  type PickModifiers,
  selectHighlighted,
  selectIsHighlighted,
} from "./listboxNode";
import type {
  ManagedListOptions,
  ManagedSelectionProps,
  MultipleSelectionProps,
  SelectionMode,
  SelectionProps,
  SelectionValue,
  SingleSelectionProps,
} from "./types";
import { type ManagedListbox, useManagedListbox } from "./useManagedListbox";
import { scrollWithinContainer, useRevealSelection } from "./useRevealSelection";
import { encodeSelectionValue, splitManagedListOptions } from "./useSelectionController";
import type { SelectionSearch } from "./useSelectionSearch";

const { withProvider, withContext } = createSlotRecipeContext(listbox);

interface ListboxContextValue {
  node: ListboxNode;
  contentId: string;
  labelId: string | undefined;
  registerLabel: (rendered: boolean) => void;
  multiple: boolean;
  disabled: boolean;
  empty: boolean;
  valueText: string;
  /** The first selected option in list order. */
  firstSelected: string | undefined;
  valueOf: (item: unknown) => string;
  isItemDisabled: (item: unknown) => boolean;
  isSelected: (value: string) => boolean;
}

const ListboxContext = createContext<ListboxContextValue | null>(null);

export function useListboxContext(): ListboxContextValue {
  const context = useContext(ListboxContext);
  if (!context) throw new Error("Listbox parts must be rendered inside Listbox.Root.");
  return context;
}

const GridContext = createContext(false);

interface ListboxRootOwnProps<T, V extends SelectionValue> {
  items: readonly T[];
  /** Compared by identity, as are `getItemLabel` and `isItemDisabled`: a new one re-reads every item. */
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: ((item: T) => boolean) | undefined;
  /** Disables every option. */
  disabled?: boolean | undefined;
  /** Arrow keys wrap from the last option to the first and back. @default false */
  loopFocus?: boolean | undefined;
  /** Typing on the list highlights the next option whose label starts with the typed text. @default true */
  typeahead?: boolean | undefined;
}

type SelectionKey = "selectionMode" | "value" | "onValueChange";

export type ListboxRootBaseProps<T, V extends SelectionValue> = StyledRootProps<
  ListboxRootOwnProps<T, V> & Record<SelectionKey | "defaultValue", unknown>
> &
  ListboxVariantProps &
  ListboxRootOwnProps<T, V> & { ref?: Ref<HTMLDivElement> | undefined };

export type ListboxRootProps<
  T = unknown,
  V extends SelectionValue = SelectionValue,
  M extends SelectionMode = "single",
> = ListboxRootBaseProps<T, V> & SelectionProps<V, M>;

interface ListboxRootInternalProps<V extends SelectionValue> {
  /** Called after every pick, including a pick of the option already selected. */
  onPick?: ((value: V, event: Event) => void) | undefined;
  scrollToIndex?: ((index: number) => void) | undefined;
}

type ListboxRootImplProps<T, V extends SelectionValue> = Omit<
  ListboxRootBaseProps<T, V>,
  keyof ListboxVariantProps
> &
  SelectionProps<V, SelectionMode> &
  ListboxRootInternalProps<V>;

function useListEntries<T, V extends SelectionValue>(
  items: readonly T[],
  getItemValue: (item: T) => V,
  getItemLabel: (item: T) => string,
  isItemDisabled: ((item: T) => boolean) | undefined,
) {
  return useMemo(() => {
    const values = new Map<string, V>();
    const entries: ListEntry[] = items.map((item) => {
      const value = getItemValue(item);
      const encoded = encodeSelectionValue(value);
      if (values.has(encoded)) {
        throw new Error(
          `Selection items must have unique values. Duplicate value: ${String(value)}`,
        );
      }
      values.set(encoded, value);
      return {
        value: encoded,
        label: getItemLabel(item),
        disabled: isItemDisabled?.(item) ?? false,
      };
    });
    return { entries, values };
  }, [items, getItemValue, getItemLabel, isItemDisabled]);
}

/** The entries between `from` and `to` in list order, both included, or none when either is missing. */
function entryRange(entries: readonly ListEntry[], from: string, to: string): ListEntry[] {
  const start = entries.findIndex((entry) => entry.value === from);
  const end = entries.findIndex((entry) => entry.value === to);
  if (start === -1 || end === -1) return [];
  const [low, high] = start <= end ? [start, end] : [end, start];
  return entries.slice(low, high + 1);
}

function RootElement<T, V extends SelectionValue>({
  ref,
  render,
  items,
  getItemValue,
  getItemLabel,
  isItemDisabled,
  selectionMode = "single",
  value,
  onValueChange,
  onPick,
  scrollToIndex,
  disabled = false,
  loopFocus = false,
  typeahead = true,
  children,
  onPointerDownCapture,
  onKeyDownCapture,
  ...rest
}: ListboxRootImplProps<T, V>) {
  const id = useId();
  const [node] = useState(() => new ListboxNode(`listbox:${id}`, null));
  const [labelRendered, setLabelRendered] = useState(false);
  const multiple = selectionMode === "multiple";
  const { entries, values } = useListEntries(items, getItemValue, getItemLabel, isItemDisabled);

  const selectedValues = useMemo<V[]>(
    () => (value == null ? [] : Array.isArray(value) ? [...(value as readonly V[])] : [value as V]),
    [value],
  );
  const selected = useMemo(
    () => new Set(selectedValues.map(encodeSelectionValue)),
    [selectedValues],
  );
  const anchorRef = useRef<{ anchor: string | null; end: string | null }>({
    anchor: null,
    end: null,
  });

  const decode = (encoded: string): V | undefined =>
    values.get(encoded) ?? selectedValues.find((entry) => encodeSelectionValue(entry) === encoded);

  const emit = (next: readonly string[]) => {
    const decoded = next.map(decode).filter((entry): entry is V => entry !== undefined);
    if (multiple) (onValueChange as MultipleSelectionProps<V>["onValueChange"])(decoded);
    else if (decoded.length > 0)
      (onValueChange as SingleSelectionProps<V>["onValueChange"])(decoded[0]);
  };

  const extendTo = (target: string) => {
    const { anchor, end } = anchorRef.current;
    if (anchor == null) return false;
    const next = new Set(selected);
    const rangeEnd = end ?? [...selected].at(-1) ?? target;
    for (const entry of entryRange(entries, anchor, rangeEnd)) {
      if (!entry.disabled) next.delete(entry.value);
    }
    for (const entry of entryRange(entries, target, anchor)) {
      if (!entry.disabled) next.add(entry.value);
    }
    anchorRef.current.end = target;
    if (next.size !== selected.size || [...next].some((entry) => !selected.has(entry))) {
      emit([...next]);
    }
    return true;
  };

  const handlePick = (picked: string, { range }: PickModifiers, event: Event) => {
    if (multiple && range && extendTo(picked)) return;
    anchorRef.current = { anchor: picked, end: picked };
    if (!multiple) {
      if (!selected.has(picked)) emit([picked]);
    } else {
      emit(
        selected.has(picked)
          ? [...selected].filter((entry) => entry !== picked)
          : [...selected, picked],
      );
    }
    const native = decode(picked);
    if (native !== undefined) onPick?.(native, event);
  };

  const handleNavigate = (target: string, { range }: PickModifiers) => {
    if (multiple && range && extendTo(target)) return;
    anchorRef.current = { anchor: target, end: target };
  };

  const handleSelectAll = () => {
    const added = entries.filter((entry) => !entry.disabled && !selected.has(entry.value));
    if (added.length > 0) emit([...selected, ...added.map((entry) => entry.value)]);
  };

  useLayoutEffect(() => {
    node.update({
      entries,
      disabled,
      loopFocus,
      typeahead,
      alwaysShowHighlight: false,
      scrollToIndex,
      onPick: handlePick,
      onNavigate: handleNavigate,
      onSelectAll: multiple ? handleSelectAll : undefined,
      onHighlightChange: undefined,
      highlightControlled: false,
    });
  });

  useEffect(() => () => node.dispose(), [node]);

  const registerLabel = useCallback((rendered: boolean) => setLabelRendered(rendered), []);
  const selectedLabels = entries.filter((entry) => selected.has(entry.value));
  const firstSelected = selectedLabels[0]?.value;

  const context: ListboxContextValue = {
    node,
    contentId: `${node.id}:content`,
    labelId: labelRendered ? `${node.id}:label` : undefined,
    registerLabel,
    multiple,
    disabled,
    empty: entries.length === 0,
    valueText: selectedLabels.map((entry) => entry.label).join(", "),
    firstSelected,
    valueOf: (item) => encodeSelectionValue(getItemValue(item as T)),
    isItemDisabled: (item) => isItemDisabled?.(item as T) ?? false,
    isSelected: (entry) => selected.has(entry),
  };

  return (
    <ListboxContext value={context}>
      <renderable.div
        ref={ref}
        render={render}
        data-disabled={disabled ? "" : undefined}
        {...(rest as ComponentProps<"div">)}
        onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
          onPointerDownCapture?.(event);
          node.onPointerDown();
        }}
        onKeyDownCapture={(event: KeyboardEvent<HTMLDivElement>) => {
          onKeyDownCapture?.(event);
          node.onKeyDownCapture();
        }}
      >
        {children}
      </renderable.div>
    </ListboxContext>
  );
}

const StyledRoot = withProvider(RootElement, "root");

/** The listbox root with the selection hooks Select builds on. */
export const ListboxRootImpl = StyledRoot as unknown as <T, V extends SelectionValue>(
  props: ListboxRootImplProps<T, V> & ListboxVariantProps,
) => JSX.Element;

interface ListboxRootComponent {
  <T, V extends SelectionValue>(props: ListboxRootProps<T, V>): JSX.Element;
  <T, V extends SelectionValue>(props: ListboxRootProps<T, V, "multiple">): JSX.Element;
}

const Root = StyledRoot as unknown as ListboxRootComponent;

const StyledContent = withContext(renderable.div, "content");
const StyledEmpty = withContext(renderable.div, "empty");
const StyledInput = withContext(renderable.input, "input");
const StyledItem = withContext(renderable.div, "item", {
  defaultProps: { "data-reveal-group": "" },
});
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const StyledItemGroupLabel = withContext(renderable.div, "itemGroupLabel");
const ItemHint = withContext("span", "itemHint");
const StyledItemText = withContext(renderable.span, "itemText");
const StyledLabel = withContext(renderable.span, "label");
const StyledValueText = withContext(renderable.span, "valueText");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator");
const StyledItemActions = withContext(renderable.div, "itemActions");

function Label(props: ComponentProps<typeof StyledLabel>) {
  const { node, registerLabel } = useListboxContext();
  useLayoutEffect(() => {
    registerLabel(true);
    return () => registerLabel(false);
  }, [registerLabel]);
  return (
    <StyledLabel
      id={`${node.id}:label`}
      {...props}
    />
  );
}

function ValueText({
  placeholder,
  children,
  ...props
}: ComponentProps<typeof StyledValueText> & { placeholder?: string | undefined }) {
  const { valueText } = useListboxContext();
  return <StyledValueText {...props}>{children || valueText || placeholder}</StyledValueText>;
}

function Empty(props: ComponentProps<typeof StyledEmpty>) {
  const { empty } = useListboxContext();
  if (!empty) return null;
  return (
    <StyledEmpty
      {...props}
      role="presentation"
    />
  );
}

const isDownloading = (event: MouseEvent) =>
  event.altKey && event.currentTarget.matches("a[href], button[type='submit']");

const opensInNewTab = (event: MouseEvent) =>
  event.currentTarget.matches("a[href]") && (event.button === 1 || event.metaKey || event.ctrlKey);

interface ItemContextValue {
  selected: boolean;
}

const ItemContext = createContext<ItemContextValue>({ selected: false });

export interface ListboxItemProps extends ComponentProps<typeof StyledItem> {
  /** One of the root's `items`. */
  item: unknown;
}

function Item({ ref, item, onClick, onMouseDown, ...props }: ListboxItemProps) {
  const context = useListboxContext();
  const { node } = context;
  const value = context.valueOf(item);
  const highlighted = useStore(node.store, selectIsHighlighted, value);
  const selected = context.isSelected(value);
  const disabled = context.disabled || context.isItemDisabled(item);
  const grid = useContext(GridContext);
  const register = useCallback(
    (element: HTMLElement | null) => (element ? node.registerItem(value, element) : undefined),
    [node, value],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);
  const itemContext = useMemo(() => ({ selected }), [selected]);

  return (
    <ItemContext value={itemContext}>
      <StyledItem
        id={node.itemId(value)}
        role={grid ? "row" : "option"}
        data-value={value}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-selected={selected ? "" : undefined}
        data-highlighted={highlighted ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
        ref={composedRef}
        onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          onMouseDown?.(event);
          if (isEditableTarget(event.target)) return;
          event.preventDefault();
          const active = event.currentTarget.ownerDocument.activeElement;
          if (node.input == null || active !== node.input)
            node.content?.focus({ preventScroll: true });
        }}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled || event.button !== 0) return;
          if (isEditableTarget(event.target)) return;
          if (isDownloading(event) || opensInNewTab(event)) return;
          node.highlight(value);
          node.pick(value, event.nativeEvent, { range: event.shiftKey });
        }}
      />
    </ItemContext>
  );
}

function ItemText(props: ComponentProps<typeof StyledItemText>) {
  return (
    <StyledItemText
      role={useContext(GridContext) ? "gridcell" : undefined}
      {...props}
    />
  );
}

const GroupLabelIdContext = createContext<string | undefined>(undefined);

function ItemGroup({ id, ...props }: ComponentProps<typeof StyledItemGroup>) {
  const generated = useId();
  const groupId = id ?? `listbox-group:${generated}`;
  const labelId = `${groupId}:label`;
  return (
    <GroupLabelIdContext value={labelId}>
      <StyledItemGroup
        id={groupId}
        role={useContext(GridContext) ? "rowgroup" : "group"}
        aria-labelledby={labelId}
        {...props}
      />
    </GroupLabelIdContext>
  );
}

function ItemGroupLabel({ children, ...props }: ComponentProps<typeof StyledItemGroupLabel>) {
  const grid = useContext(GridContext);
  return (
    <StyledItemGroupLabel
      id={useContext(GroupLabelIdContext)}
      role={grid ? "row" : "presentation"}
      {...props}
    >
      {grid ? <span role="rowheader">{children}</span> : children}
    </StyledItemGroupLabel>
  );
}

function ItemIndicator({ children, ...props }: ComponentProps<typeof StyledItemIndicator>) {
  const { selected } = useContext(ItemContext);
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

type ContentProps = Omit<ComponentProps<typeof StyledContent>, "role"> & {
  /** `grid` when items hold interactive actions: items become rows and their text and actions cells. */
  role?: "listbox" | "grid";
  scrollAreaProps?: Unstyled<
    Omit<ScrollAreaProps, "children" | "scrollbars">,
    "colorPalette" | "scrollbar"
  >;
};

function Content({
  ref,
  children,
  role = "listbox",
  scrollAreaProps,
  style,
  onFocus,
  onBlur,
  onKeyDown,
  onMouseDown,
  ...props
}: ContentProps) {
  const context = useListboxContext();
  const { node } = context;
  const highlighted = useStore(node.store, selectHighlighted);
  const [sizeStyle, sizedProps] = splitInlineSizes(props, ["height", "maxHeight"]);
  const setContent = useCallback(
    (element: HTMLElement | null) => {
      node.setContent(element);
      return () => node.setContent(null);
    },
    [node],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, setContent);

  return (
    <ScrollArea.Root
      scrollbar="thumb"
      {...scrollAreaProps}
      scrollbars="vertical"
    >
      <ScrollArea.Viewport
        render={
          <StyledContent
            id={context.contentId}
            tabIndex={0}
            aria-labelledby={context.labelId}
            aria-multiselectable={context.multiple || undefined}
            aria-activedescendant={highlighted == null ? undefined : node.itemId(highlighted)}
            {...sizedProps}
            ref={composedRef}
            style={{ ...sizeStyle, ...style }}
            onFocus={(event) => {
              onFocus?.(event);
              if (event.target !== event.currentTarget) return;
              node.onContentFocus(event.currentTarget, context.firstSelected);
            }}
            onBlur={(event) => {
              onBlur?.(event);
              if (event.target === event.currentTarget) node.onContentBlur();
            }}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              onKeyDown?.(event);
              node.onContentKeyDown(event);
            }}
            onMouseDown={(event) => {
              onMouseDown?.(event);
              if (
                node.input != null &&
                event.currentTarget.ownerDocument.activeElement === node.input
              ) {
                event.preventDefault();
              }
            }}
          />
        }
        role={role}
      >
        <GridContext value={role === "grid"}>
          <ScrollArea.Content>{children}</ScrollArea.Content>
        </GridContext>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export interface ListboxInputOptions {
  /** Highlights the first option whenever the typed text changes the options. */
  autoHighlight?: boolean | undefined;
}

/** Props that let an input drive the list: arrow keys move the highlight, Enter picks it. */
export function useListboxInputProps({ autoHighlight = false }: ListboxInputOptions = {}): Record<
  string,
  unknown
> & { ref: (element: HTMLElement | null) => () => void } {
  const context = useListboxContext();
  const { node } = context;
  const highlighted = useStore(node.store, selectHighlighted);
  const ref = useCallback(
    (element: HTMLElement | null) => {
      node.setInput(element);
      return () => node.setInput(null);
    },
    [node],
  );
  return {
    ref,
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    enterKeyHint: "go",
    disabled: context.disabled || undefined,
    "data-disabled": context.disabled ? "" : undefined,
    "aria-haspopup": "listbox",
    "aria-controls": context.contentId,
    "aria-autocomplete": "list",
    "aria-activedescendant": highlighted == null ? undefined : node.itemId(highlighted),
    onFocus: () => node.onInputFocus(autoHighlight),
    onBlur: () => node.onInputBlur(),
    onInput: (event: FormEvent<HTMLInputElement>) => {
      if (!autoHighlight || event.currentTarget.value.trim()) return;
      queueMicrotask(() => node.highlight(null));
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      node.onInputKeyDown(event);
    },
  };
}

function Input({
  ref,
  autoHighlight,
  ...props
}: ComponentProps<typeof StyledInput> & ListboxInputOptions) {
  const { ref: inputRef, ...inputProps } = useListboxInputProps({ autoHighlight });
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, inputRef);
  return (
    <StyledInput
      {...mergeProps<ComponentProps<typeof StyledInput>>(
        inputProps as ComponentProps<typeof StyledInput>,
        props,
      )}
      ref={composedRef}
    />
  );
}

function ItemActions({
  children,
  onClick,
  onKeyDown,
  onMouseDown,
  onPointerDown,
  ...props
}: ComponentProps<typeof StyledItemActions>) {
  return (
    <StyledItemActions
      role="gridcell"
      {...props}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        onMouseDown?.(event);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
    >
      {children}
    </StyledItemActions>
  );
}

function ManagedItem({
  text,
  hint,
  actions,
  ...props
}: ListboxItemProps & { text: ReactNode; hint: ReactNode; actions: ReactNode }) {
  const textId = useId();
  const { hintId, describedBy } = useItemSlotIds({ hint }, props["aria-describedby"]);

  return (
    <Item
      aria-labelledby={props["aria-label"] === undefined ? textId : undefined}
      {...props}
      aria-describedby={describedBy}
    >
      <ItemText id={textId}>{text}</ItemText>
      {hintId && (
        <ItemHint
          id={hintId}
          aria-hidden
        >
          {hint}
        </ItemHint>
      )}
      {actions}
      <ItemIndicator />
    </Item>
  );
}

const DEFAULT_EMPTY_MESSAGE = "No items available";

/** Presentational empty-state block. Callers own the visibility condition. */
function ListboxEmptyState({ children = DEFAULT_EMPTY_MESSAGE }: { children?: ReactNode }) {
  return (
    <EmptyState.Root size="sm">
      <EmptyState.Content>
        <EmptyState.Description>{children}</EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

interface SelectionSearchFieldProps extends Omit<SearchInputProps, "value" | "onClear"> {
  search: SelectionSearch;
  endElement?: ReactNode;
}

export function SelectionSearchField({
  search,
  endElement = search.endElement,
  placeholder = search.placeholder,
  autoFocus = search.autoFocus,
  onChange,
  size = "sm",
  variant = "outline",
  ...props
}: SelectionSearchFieldProps) {
  return (
    <HStack
      gap="1"
      px="1"
      _first={{ pt: "1" }}
    >
      <SearchInput
        aria-label={placeholder}
        {...props}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={search.query}
        onChange={(event) => {
          search.setQuery(event.target.value);
          onChange?.(event);
        }}
        onClear={() => search.setQuery("")}
        size={size}
        variant={variant}
      />
      {endElement}
    </HStack>
  );
}

interface ListboxSearchFieldProps extends SelectionSearchFieldProps {
  inputRef: Ref<HTMLInputElement>;
}

function SearchFieldInput({ inputRef, ...props }: ListboxSearchFieldProps) {
  const { ref, ...inputProps } = useListboxInputProps({ autoHighlight: true });
  const composedRef = useComposedRefs(inputRef as Ref<HTMLElement>, ref);
  return (
    <SelectionSearchField
      {...mergeProps<SelectionSearchFieldProps>(
        inputProps as unknown as SelectionSearchFieldProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

export function ListboxSearchField(props: ListboxSearchFieldProps) {
  if (!props.search.showInput) return null;
  return <SearchFieldInput {...props} />;
}

// --- Simplified API ---

const VIRTUAL_ITEM_HEIGHT = 36;

interface ListboxManagedProps<T, V extends SelectionValue>
  extends ManagedSelectionProps<T, V>, ManagedListOptions<T, V> {
  label?: string;
  /** Styles for the scrolling list content. */
  contentCss?: CssProp;
}

type ManagedRootKey =
  | "children"
  | "items"
  | "getItemValue"
  | "getItemLabel"
  | "isItemDisabled"
  | "render"
  | SelectionKey;

type ListboxBaseProps<T, V extends SelectionValue> = Omit<
  ListboxRootBaseProps<T, V>,
  ManagedRootKey
> &
  ListboxManagedProps<T, V>;

export type ListboxProps<
  T = unknown,
  V extends SelectionValue = SelectionValue,
  M extends SelectionMode = "single",
> = ListboxBaseProps<T, V> & SelectionProps<V, M>;

// Mounted only in virtual mode, so `useVirtualizer` never runs for plain lists.
function VirtualListRows<T>({
  items,
  renderRow,
  scrollElement,
  getItemKey,
  scrollToIndexRef,
}: {
  items: readonly T[];
  renderRow: (item: T, index: number) => ReactNode;
  scrollElement: HTMLDivElement | null;
  getItemKey: (index: number) => string | number;
  scrollToIndexRef: ScrollToIndexRef;
}) {
  const [inset, setInset] = useState({ start: 0, end: 0 });
  useLayoutEffect(() => {
    if (!scrollElement) return;
    const style = getComputedStyle(scrollElement);
    setInset({
      start: parseFloat(style.paddingTop) || 0,
      end: parseFloat(style.paddingBottom) || 0,
    });
  }, [scrollElement]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => VIRTUAL_ITEM_HEIGHT,
    overscan: 10,
    getItemKey,
    scrollMargin: inset.start,
    scrollPaddingStart: inset.start,
    scrollPaddingEnd: inset.end,
  });

  useScrollToIndexRef(virtualizer, scrollToIndexRef);

  return (
    <VirtualRows
      virtualizer={virtualizer}
      items={items}
    >
      {renderRow}
    </VirtualRows>
  );
}

interface ManagedListProps<T, V extends SelectionValue> extends Omit<
  ManagedListOptions<T, V>,
  "indicatorPosition" | "virtual"
> {
  managed: ManagedListbox<T, V>;
  contentProps?: HTMLStyledProps<"div">;
}

export function ManagedList<T, V extends SelectionValue>({
  managed,
  loading,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  emptyState,
  renderItem,
  renderItemActions,
  renderItemHint,
  renderGroupLabel,
  getItemProps,
  listMaxHeight,
  contentProps,
}: ManagedListProps<T, V>) {
  const { controller, virtual, scrollToIndexRef } = managed;
  const { items, groups, grouped } = controller;
  // State, not a ref: the rows' layout effects run before this ancestor's ref attaches.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const renderRow = (item: T) => {
    const state = controller.getItemState(item);
    return (
      <ManagedItem
        key={encodeSelectionValue(state.value)}
        item={item}
        {...getItemProps?.(item)}
        text={renderItem ? renderItem(item, state) : controller.getItemLabel(item)}
        hint={renderItemHint?.(item, state)}
        actions={renderItemActions && <ItemActions>{renderItemActions(item, state)}</ItemActions>}
      />
    );
  };

  const isEmpty = items.length === 0;
  const showEmpty = !loading && isEmpty;
  const { ref: contentRef, ...listContentProps } =
    listMaxHeight == null ? (contentProps ?? {}) : { ...contentProps, maxHeight: listMaxHeight };
  const listRef = useComposedRefs(setScrollElement, contentRef);

  const renderRows = () => {
    if (virtual) {
      return (
        !isEmpty && (
          <VirtualListRows
            items={items}
            renderRow={renderRow}
            scrollElement={scrollElement}
            getItemKey={(index) => encodeSelectionValue(controller.getItemValue(items[index]))}
            scrollToIndexRef={scrollToIndexRef}
          />
        )
      );
    }
    if (!grouped) return items.map(renderRow);
    return groups.map(([group, groupItems]) => (
      <ItemGroup key={group}>
        {group !== "" && (
          <ItemGroupLabel>
            {renderGroupLabel ? renderGroupLabel(group, groupItems) : group}
          </ItemGroupLabel>
        )}
        {groupItems.map(renderRow)}
      </ItemGroup>
    ));
  };

  // One element across empty, plain and virtual, so the scroll area and the highlight keep it.
  return (
    <>
      <Content
        {...listContentProps}
        role={renderItemActions ? "grid" : "listbox"}
        ref={listRef}
      >
        {renderRows()}
        {showEmpty && emptyState == null && <ListboxEmptyState>{emptyMessage}</ListboxEmptyState>}
      </Content>
      {showEmpty && emptyState}
      <VisuallyHidden
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {showEmpty && emptyMessage}
      </VisuallyHidden>
    </>
  );
}

function RevealSelection<T, V extends SelectionValue>({
  managed,
}: {
  managed: ManagedListbox<T, V>;
}) {
  const { node, firstSelected } = useListboxContext();
  const { controller, virtual } = managed;

  useRevealSelection(node, true, controller.search.query, firstSelected, (value) => {
    const content = node.content;
    if (virtual) {
      node.scrollTo(value);
    } else {
      const item = node.elementOf(value);
      if (content && item) scrollWithinContainer(content, item);
    }
    const active = content?.ownerDocument.activeElement;
    // Unfocused, a highlight would read as a second selection.
    if (active != null && (content?.contains(active) || active === node.input)) {
      node.highlight(value);
    }
  });

  return null;
}

function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & SingleSelectionProps<V>,
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & MultipleSelectionProps<V>,
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(props: ListboxProps<T, V, SelectionMode>) {
  const listboxProps = { ...props, search: props.search ?? true };
  const { managed, rootProps, rest } = useManagedListbox<T, V, typeof listboxProps>(listboxProps);
  const {
    label,
    contentCss,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...restProps
  } = rest;
  const [listOptions, rootRest] = splitManagedListOptions<T, V, typeof restProps>(restProps);
  const contentProps: HTMLStyledProps<"div"> = { css: contentCss };
  if (ariaLabel !== undefined) contentProps["aria-label"] = ariaLabel;
  if (ariaLabelledBy !== undefined) contentProps["aria-labelledby"] = ariaLabelledBy;

  return (
    <ListboxRootImpl
      indicatorPosition={listOptions.indicatorPosition}
      {...rootRest}
      {...rootProps}
    >
      <RevealSelection managed={managed} />
      {label && <Label>{label}</Label>}
      <ListboxSearchField
        search={managed.controller.search}
        inputRef={managed.inputRef}
      />
      <ManagedList
        managed={managed}
        {...listOptions}
        contentProps={contentProps}
      />
    </ListboxRootImpl>
  );
}

export const Listbox = Object.assign(ListboxSimple, {
  Root,
  Content,
  Empty,
  EmptyState: ListboxEmptyState,
  Input,
  Item,
  ItemActions,
  ItemGroup,
  ItemGroupLabel,
  ItemHint,
  ItemIndicator,
  ItemText,
  Label,
  ValueText,
});
