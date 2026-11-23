import {
  type ComponentProps,
  type FormEvent,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { type HTMLStyledProps, VisuallyHidden, createSlotRecipeContext } from "#styled-system/jsx";
import { type ListboxVariantProps, listbox } from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import { isEditableTarget } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { RangeSelection } from "../../primitives/composite";
import {
  ListboxNode,
  type PickModifiers,
  useListboxActiveDescendant,
  useListboxContentRef,
  useListboxInputRef,
} from "../../primitives/listbox";
import { dataAttr, mergeProps, renderable } from "../../primitives/render";
import type { CssProp, Unstyled } from "../../types";
import { EmptyState } from "../EmptyState";
import { useItemSlotIds } from "../itemSlots";
import { ListboxGridContext, createListboxParts } from "../listboxParts";
import { createPartContext } from "../partContext";
import type { StyledRootProps } from "../rootProps";
import {
  ScrollArea,
  type ScrollAreaProps,
  type ScrollToIndexRef,
  useVirtualList,
} from "../ScrollArea";
import {
  type ManagedSelectionProps,
  type MultipleSelectionProps,
  type SelectionItemSource,
  type SelectionMode,
  type SelectionProps,
  SelectionSearchField,
  type SelectionSearchFieldProps,
  type SelectionValue,
  type SingleSelectionProps,
  decodeSelection,
  emitSelection,
  encodeSelectionValue,
  toSelectionArray,
  useListEntries,
} from "../selection";
import type { ManagedListOptions } from "./types";
import { type ManagedListbox, useManagedListbox } from "./useManagedListbox";
import { useRevealSelection } from "./useRevealSelection";

const { withProvider, withContext } = createSlotRecipeContext(listbox);

const StyledItem = withContext(renderable.div, "item", {
  defaultProps: { "data-reveal-group": "" },
});
const StyledItemText = withContext(renderable.span, "itemText");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator");
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const StyledItemGroupLabel = withContext(renderable.div, "itemGroupLabel");

const parts = createListboxParts(
  {
    Item: StyledItem,
    ItemText: StyledItemText,
    ItemIndicator: StyledItemIndicator,
    ItemGroup: StyledItemGroup,
    ItemGroupLabel: StyledItemGroupLabel,
  },
  "listbox-group",
);

interface ListboxContextValue {
  node: ListboxNode;
  /** The rendered content's id. */
  contentId: string | undefined;
  /** The rendered label's id. */
  labelId: string | undefined;
  reportRendered: ReportRendered<"label" | "content">;
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

export const [ListboxContext, useListboxContext] = createPartContext<ListboxContextValue>(
  "<Listbox.Root>",
  "Listbox parts",
);

interface ListboxRootOwnProps<T, V extends SelectionValue> extends SelectionItemSource<T, V> {
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
  const [rendered, reportRendered] = useRenderedParts<"label" | "content">();
  const multiple = selectionMode === "multiple";
  const { entries, values } = useListEntries({ items, getItemValue, getItemLabel, isItemDisabled });

  const selectedValues = useMemo(() => toSelectionArray<V>(value), [value]);
  const selected = useMemo(
    () => new Set(selectedValues.map(encodeSelectionValue)),
    [selectedValues],
  );
  const [rangeSelection] = useState(() => new RangeSelection());

  const emit = (next: readonly string[]) =>
    emitSelection(selectionMode, onValueChange, decodeSelection(next, values, selectedValues));

  const extendTo = (target: string, from?: string) => {
    const next = rangeSelection.extendTo(entries, selected, target, from);
    if (next === null) return false;
    if (next.length !== selected.size || next.some((entry) => !selected.has(entry))) emit(next);
    return true;
  };

  const handlePick = (picked: string, { range }: PickModifiers, event: Event) => {
    node.highlight(picked);
    if (multiple && range && extendTo(picked)) return;
    rangeSelection.reset(picked);
    if (!multiple) {
      if (!selected.has(picked)) emit([picked]);
    } else {
      emit(
        selected.has(picked)
          ? [...selected].filter((entry) => entry !== picked)
          : [...selected, picked],
      );
    }
    const [native] = decodeSelection([picked], values, selectedValues);
    if (native !== undefined) onPick?.(native, event);
  };

  const handleNavigate = (target: string, { range }: PickModifiers, from: string | null) => {
    if (range) extendTo(target, from ?? target);
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
      autoHighlight: false,
      scrollToIndex,
      onPick: handlePick,
      onNavigate: multiple ? handleNavigate : undefined,
      onSelectAll: multiple ? handleSelectAll : undefined,
      onHighlightChange: undefined,
      highlightControlled: false,
    });
  });

  useEffect(() => () => node.dispose(), [node]);

  const selectedLabels = entries.filter((entry) => selected.has(entry.value));
  const firstSelected = selectedLabels[0]?.value;

  const context: ListboxContextValue = {
    node,
    contentId: rendered.content,
    labelId: rendered.label,
    reportRendered,
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
        data-disabled={dataAttr(disabled)}
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
const ItemHint = withContext(renderable.span, "itemHint");
const StyledLabel = withContext(renderable.span, "label");
const StyledValueText = withContext(renderable.span, "valueText");
const StyledItemActions = withContext(renderable.div, "itemActions");
const { ItemText, ItemIndicator, ItemGroup, ItemGroupLabel } = parts;

function Label({ id, ...props }: ComponentProps<typeof StyledLabel>) {
  const { node, reportRendered } = useListboxContext();
  const labelId = useReportRendered(reportRendered, "label", id ?? `${node.id}:label`);
  return (
    <StyledLabel
      id={labelId}
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

export interface ListboxItemProps extends ComponentProps<typeof StyledItem> {
  /** One of the root's `items`. */
  item: unknown;
}

function Item({ item, onClick, onMouseDown, ...props }: ListboxItemProps) {
  const context = useListboxContext();
  const { node } = context;
  const value = context.valueOf(item);
  const disabled = context.disabled || context.isItemDisabled(item);

  return (
    <parts.Item
      node={node}
      value={value}
      selected={context.isSelected(value)}
      disabled={disabled}
      {...props}
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
        node.onItemClick(value, event);
      }}
    />
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
  id,
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
  const contentId = useReportRendered(
    context.reportRendered,
    "content",
    id ?? `${node.id}:content`,
  );
  const activeDescendant = useListboxActiveDescendant(node);
  const [sizeStyle, sizedProps] = splitInlineSizes(props, ["height", "maxHeight"]);
  const composedRef = useComposedRefs(ref, useListboxContentRef(node));

  return (
    <ScrollArea.Root
      scrollbar="thumb"
      {...scrollAreaProps}
      scrollbars="vertical"
    >
      <ScrollArea.Viewport
        render={
          <StyledContent
            id={contentId}
            tabIndex={0}
            aria-labelledby={context.labelId}
            aria-multiselectable={context.multiple || undefined}
            aria-activedescendant={activeDescendant}
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
        <ListboxGridContext value={role === "grid"}>
          <ScrollArea.Content>{children}</ScrollArea.Content>
        </ListboxGridContext>
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
  const activeDescendant = useListboxActiveDescendant(node);
  const ref = useListboxInputRef(node);
  return {
    ref,
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    enterKeyHint: "go",
    disabled: context.disabled || undefined,
    "data-disabled": dataAttr(context.disabled),
    "aria-haspopup": "listbox",
    "aria-controls": context.contentId,
    "aria-autocomplete": "list",
    "aria-activedescendant": activeDescendant,
    onFocus: () => node.onInputFocus(autoHighlight),
    onBlur: () => node.onInputBlur(),
    onInput: (event: FormEvent<HTMLInputElement>) => {
      node.setSuggesting(true);
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
  const composedRef = useComposedRefs(ref, inputRef);
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

interface ListboxSearchFieldProps extends SelectionSearchFieldProps {
  inputRef: Ref<HTMLInputElement>;
}

function SearchFieldInput({ inputRef, ...props }: ListboxSearchFieldProps) {
  const { ref, ...inputProps } = useListboxInputProps({ autoHighlight: true });
  const composedRef = useComposedRefs(inputRef, ref);
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

// Mounted only in virtual mode, so the virtualizer never runs for plain lists.
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
  const getScrollElement = useCallback(() => scrollElement, [scrollElement]);
  return useVirtualList({
    items,
    getScrollElement,
    estimateSize: () => VIRTUAL_ITEM_HEIGHT,
    getItemKey,
    scrollToIndexRef,
    renderItem: renderRow,
  }).rows;
}

interface ManagedListProps<T, V extends SelectionValue> extends Omit<
  ManagedListOptions<T, V>,
  "indicatorPosition" | "virtual"
> {
  managed: ManagedListbox<T, V>;
  contentProps?: Omit<ContentProps, "role">;
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

  useRevealSelection(node, true, managed.controller.search.query, firstSelected, (value) => {
    node.scrollTo(value);
    const content = node.content;
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
  const { managed, rootProps, listOptions, rest } = useManagedListbox<T, V, typeof listboxProps>(
    listboxProps,
  );
  const {
    label,
    contentCss,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rootRest
  } = rest;
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
