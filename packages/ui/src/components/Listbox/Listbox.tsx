import type { CollectionItem } from "@ark-ui/react/collection";
import { useEnvironmentContext } from "@ark-ui/react/environment";
import { ark } from "@ark-ui/react/factory";
import { Listbox as ArkListbox, ListboxContext, useListboxContext } from "@ark-ui/react/listbox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  type ComponentProps,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  type SyntheticEvent,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
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
import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { CssProp, Unstyled, WithRef } from "../../types";
import { EmptyState } from "../EmptyState";
import { SearchInput, type SearchInputProps } from "../Input";
import { useItemSlotIds } from "../itemSlots";
import type { StyledRootProps } from "../rootProps";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";
import { type ScrollToIndexRef, VirtualRows, useScrollToIndexRef } from "../ScrollArea/VirtualRows";
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
import { splitManagedListOptions } from "./useSelectionController";
import type { SelectionSearch } from "./useSelectionSearch";

export { createListCollection, useListCollection } from "@ark-ui/react/collection";
export type { CollectionItem, ListCollection } from "@ark-ui/react/collection";

const { withProvider, withContext } = createSlotRecipeContext(listbox);

type RootProps = StyledRootProps<ArkListbox.RootBaseProps<CollectionItem>> & ListboxVariantProps;

const Root = withProvider(ArkListbox.Root, "root") as ArkListbox.RootComponent<RootProps>;

const RootProvider = withProvider(
  ArkListbox.RootProvider,
  "root",
) as ArkListbox.RootProviderComponent<RootProps>;

const GridContext = createContext(false);

const StyledContent = withContext(ArkListbox.Content, "content");
const Empty = withContext(ArkListbox.Empty, "empty");
const Input = withContext(ArkListbox.Input, "input");
const StyledItem = withContext(ArkListbox.Item, "item", {
  defaultProps: { "data-reveal-group": "" },
});
const StyledItemGroup = withContext(ArkListbox.ItemGroup, "itemGroup");
const StyledItemGroupLabel = withContext(ArkListbox.ItemGroupLabel, "itemGroupLabel");
const ItemHint = withContext("span", "itemHint", {
  defaultProps: { "data-scope": "listbox", "data-part": "item-hint" },
});
const StyledItemText = withContext(ArkListbox.ItemText, "itemText");

function Item(props: ComponentProps<typeof StyledItem>) {
  return (
    <StyledItem
      role={useContext(GridContext) ? "row" : undefined}
      {...props}
    />
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

function ItemGroup(props: ComponentProps<typeof StyledItemGroup>) {
  return (
    <StyledItemGroup
      role={useContext(GridContext) ? "rowgroup" : undefined}
      {...props}
    />
  );
}

function ItemGroupLabel({ children, ...props }: ComponentProps<typeof StyledItemGroupLabel>) {
  const grid = useContext(GridContext);
  return (
    <StyledItemGroupLabel
      role={grid ? "row" : undefined}
      {...props}
    >
      {grid ? <span role="rowheader">{children}</span> : children}
    </StyledItemGroupLabel>
  );
}
const Label = withContext(ArkListbox.Label, "label");
const ValueText = withContext(ArkListbox.ValueText, "valueText");

const StyledItemIndicator = withContext(ArkListbox.ItemIndicator, "itemIndicator");
const StyledItemActions = withContext(ark.div, "itemActions");

function ItemIndicator({ ref, ...props }: WithRef<HTMLStyledProps<"div">>) {
  return (
    <StyledItemIndicator
      ref={ref}
      hidden={false}
      {...props}
    >
      <CheckIcon />
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
  ...props
}: WithRef<ContentProps, HTMLDivElement>) {
  const [sizeStyle, sizedProps] = splitInlineSizes(props, ["height", "maxHeight"]);
  const contentId = useListboxContext().getContentProps().id;

  return (
    <ScrollArea.Root
      {...scrollAreaProps}
      scrollbars="vertical"
      // The viewport and the listbox content are one element, which both machines look up by id.
      ids={{ viewport: contentId }}
    >
      <ScrollArea.Viewport
        asChild
        role={role}
      >
        <StyledContent
          ref={ref}
          {...sizedProps}
          style={{ ...sizeStyle, ...style }}
        >
          <GridContext value={role === "grid"}>
            <ScrollArea.Content>{children}</ScrollArea.Content>
          </GridContext>
        </StyledContent>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
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
  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <StyledItemActions
      role="gridcell"
      {...props}
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onMouseDown={(event) => {
        stopPropagation(event);
        onMouseDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        stopPropagation(event);
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
}: ComponentProps<typeof Item> & { text: ReactNode; hint: ReactNode; actions: ReactNode }) {
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

export function ListboxSearchField({ inputRef, ...props }: ListboxSearchFieldProps) {
  if (!props.search.showInput) return null;

  return (
    <ArkListbox.Input
      ref={inputRef}
      asChild
      autoHighlight
    >
      <SelectionSearchField {...props} />
    </ArkListbox.Input>
  );
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
  | "collection"
  | "defaultValue"
  | "deselectable"
  | "onValueChange"
  | "selectionMode"
  | "value";

type ListboxBaseProps<T, V extends SelectionValue> = Omit<
  ArkListbox.RootComponentProps<T, RootProps>,
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
  items: T[];
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

  // Expose scrollToIndex to the parent's Ark `scrollToIndexFn` (keyboard nav past the rendered window).
  useScrollToIndexRef(virtualizer, scrollToIndexRef);

  return (
    <VirtualRows virtualizer={virtualizer}>
      {(virtualItem) => renderRow(items[virtualItem.index], virtualItem.index)}
    </VirtualRows>
  );
}

function useSearchFocusRetention(
  inputRef: RefObject<HTMLInputElement | null>,
  { onMouseDownCapture, onMouseDown, ...props }: HTMLStyledProps<"div"> = {},
): HTMLStyledProps<"div"> {
  const searchFocusedRef = useRef(false);

  return {
    ...props,
    // Items move focus to the list in their own mousedown, so sample the input before they run.
    onMouseDownCapture: (event) => {
      onMouseDownCapture?.(event);
      searchFocusedRef.current = inputRef.current?.matches(":focus") === true;
    },
    onMouseDown: (event) => {
      onMouseDown?.(event);
      if (!searchFocusedRef.current) return;
      event.preventDefault();
      inputRef.current?.focus();
    },
  };
}

interface ManagedListProps<T, V extends SelectionValue> extends Omit<
  ManagedListOptions<T, V>,
  "indicatorPosition" | "virtual"
> {
  managed: ManagedListbox<T, V>;
  contentProps?: HTMLStyledProps<"div">;
  typeahead?: boolean;
}

export function ManagedList<T, V extends SelectionValue>({
  managed,
  typeahead = true,
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
  const { controller, selectionMode, virtual, scrollToIndexRef, inputRef } = managed;
  const { collection, groups, grouped } = controller;
  const api = useListboxContext();
  const typeaheadRef = useRef({ keysSoFar: "", timer: -1 });
  // State, not a ref: the rows' layout effects run before this ancestor's ref attaches.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const renderRow = (item: T) => {
    const state = controller.getItemState(item);
    return (
      <ManagedItem
        key={collection.getItemValue(item)}
        item={item}
        {...getItemProps?.(item)}
        text={renderItem ? renderItem(item, state) : collection.stringifyItem(item)}
        hint={renderItemHint?.(item, state)}
        actions={renderItemActions && <ItemActions>{renderItemActions(item, state)}</ItemActions>}
      />
    );
  };

  const isEmpty = collection.items.length === 0;
  const showEmpty = !loading && isEmpty;
  const {
    ref: contentRef,
    onKeyDown,
    onKeyDownCapture,
    ...listContentProps
  } = useSearchFocusRetention(
    inputRef,
    listMaxHeight == null ? contentProps : { ...contentProps, maxHeight: listMaxHeight },
  );
  const listRef = useComposedRefs(setScrollElement, contentRef);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event);
    if (!typeahead || event.defaultPrevented || api.disabled) return;
    if (event.target !== event.currentTarget) return;
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey) return;
    const state = typeaheadRef.current;
    if (event.key === " " && state.keysSoFar === "") return;
    event.preventDefault();
    // zag's Space picks the highlighted option whenever its own typeahead is off.
    if (event.key === " ") event.stopPropagation();
    const match = collection.search(event.key, {
      state,
      currentValue: api.highlightedValue,
    });
    if (match != null) api.highlightValue(match);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || selectionMode !== "multiple") return;
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "a") return;
    event.preventDefault();
    const selectAll = controller.getSelectAllState();
    if (selectAll.allSelected) return;
    const next = selectAll.toggle();
    if (next.length > controller.selectedValues.length) controller.setValue(next);
  };

  const renderRows = () => {
    if (virtual) {
      return (
        !isEmpty && (
          <VirtualListRows
            items={collection.items}
            renderRow={renderRow}
            scrollElement={scrollElement}
            getItemKey={(index) => collection.getItemValue(collection.items[index]) ?? index}
            scrollToIndexRef={scrollToIndexRef}
          />
        )
      );
    }
    if (!grouped) return collection.items.map(renderRow);
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

  // One element across empty, plain and virtual: zag binds its highlight scrolling to it once.
  return (
    <>
      <Content
        {...listContentProps}
        role={renderItemActions ? "grid" : "listbox"}
        ref={listRef}
        onKeyDownCapture={handleKeyDownCapture}
        onKeyDown={handleKeyDown}
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
  const api = useListboxContext();
  const environment = useEnvironmentContext();
  const { controller, virtual, scrollToIndexRef } = managed;

  useRevealSelection(true, controller.search.query, (value) => {
    const { collection, getContentProps, getItemProps, getRootProps } = api;
    const root = environment.getRootNode() as Document | ShadowRoot;
    const byId = (id: string | undefined) => (id == null ? null : root.getElementById(id));
    if (virtual) {
      scrollToIndexRef.current?.(collection.indexOf(value));
    } else {
      const container = byId(getContentProps().id);
      const item = collection.find(value);
      const itemEl = item == null ? null : byId(getItemProps({ item }).id);
      if (container && itemEl) scrollWithinContainer(container, itemEl);
    }
    // Unfocused, a highlight would read as a second selection.
    if (byId(getRootProps().id)?.contains(root.activeElement)) api.highlightValue(value);
  });

  return null;
}

function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & SingleSelectionProps<V> & { ref?: Ref<HTMLDivElement> },
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & MultipleSelectionProps<V> & { ref?: Ref<HTMLDivElement> },
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxProps<T, V, SelectionMode> & { ref?: Ref<HTMLDivElement> },
) {
  const listboxProps = { ...props, search: props.search ?? true };
  const { managed, rootProps, rest } = useManagedListbox<T, V, typeof listboxProps>(listboxProps);
  const {
    ref,
    label,
    contentCss,
    typeahead,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...restProps
  } = rest;
  const [listOptions, rootRest] = splitManagedListOptions<T, V, typeof restProps>(restProps);
  const contentProps: HTMLStyledProps<"div"> = { css: contentCss };
  if (ariaLabel !== undefined) contentProps["aria-label"] = ariaLabel;
  if (ariaLabelledBy !== undefined) contentProps["aria-labelledby"] = ariaLabelledBy;

  return (
    <Root
      ref={ref}
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
        typeahead={typeahead}
        {...listOptions}
        contentProps={contentProps}
      />
    </Root>
  );
}

export type ListboxRootProps = ComponentProps<typeof Root>;

export const Listbox = Object.assign(ListboxSimple, {
  Root,
  RootProvider,
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
  Context: ListboxContext,
});
