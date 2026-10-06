import { Listbox as ArkListbox, ListboxContext, useListboxContext } from "@ark-ui/react/listbox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  type ComponentProps,
  type JSX,
  type ReactNode,
  type Ref,
  type RefObject,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Box, HStack, type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import { type ListboxVariantProps, listbox } from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import type { CssProp, Unstyled, WithRef } from "../../types";
import { EmptyState } from "../EmptyState";
import { SearchInput, type SearchInputProps } from "../Input";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";
import { VirtualRows } from "../ScrollArea/VirtualRows";
import type {
  ManagedListOptions,
  MultipleSelectionProps,
  SelectionItemState,
  SelectionItemsProps,
  SelectionProps,
  SelectionSearchOptions,
  SelectionValue,
  SingleSelectionProps,
} from "./types";
import {
  type SelectionController,
  splitManagedListOptions,
  useSelectionController,
} from "./useSelectionController";

export { createListCollection, useListCollection } from "@ark-ui/react/collection";
export type { CollectionItem, ListCollection } from "@ark-ui/react/collection";

const { withProvider, withContext } = createSlotRecipeContext(listbox);

type RootProps = HTMLStyledProps<"div"> & ListboxVariantProps;

const Root = withProvider(ArkListbox.Root, "root") as ArkListbox.RootComponent<RootProps>;

const RootProvider = withProvider(
  ArkListbox.RootProvider,
  "root",
) as ArkListbox.RootProviderComponent<RootProps>;

const StyledContent = withContext(ArkListbox.Content, "content");
const Empty = withContext(ArkListbox.Empty, "empty");
const Input = withContext(ArkListbox.Input, "input");
const Item = withContext(ArkListbox.Item, "item");
const ItemGroup = withContext(ArkListbox.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkListbox.ItemGroupLabel, "itemGroupLabel");
const ItemText = withContext(ArkListbox.ItemText, "itemText");
const Label = withContext(ArkListbox.Label, "label");
const ValueText = withContext(ArkListbox.ValueText, "valueText");

const StyledItemIndicator = withContext(ArkListbox.ItemIndicator, "itemIndicator");
export const LISTBOX_ACTION_ATTRIBUTE = "data-listbox-item-action";

function ItemIndicator({ ref, ...props }: WithRef<HTMLStyledProps<"div">>) {
  return (
    <StyledItemIndicator
      ref={ref}
      {...props}
    >
      <CheckIcon />
    </StyledItemIndicator>
  );
}

type ContentProps = ComponentProps<typeof StyledContent> & {
  scrollAreaProps?: Unstyled<
    Omit<ScrollAreaProps, "children" | "scrollbars">,
    "colorPalette" | "scrollbar"
  >;
};

function Content({
  ref,
  children,
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
        role="listbox"
      >
        <StyledContent
          ref={ref}
          {...sizedProps}
          style={{ ...sizeStyle, ...style }}
        >
          <ScrollArea.Content>{children}</ScrollArea.Content>
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
  onMouseDown,
  onPointerDown,
  ...props
}: HTMLStyledProps<"div">) {
  const stopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <Box
      {...{ [LISTBOX_ACTION_ATTRIBUTE]: "" }}
      display="inline-flex"
      alignItems="center"
      gap="1"
      flexShrink="0"
      role="presentation"
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
    >
      {children}
    </Box>
  );
}

/** Presentational empty-state block. Callers own the visibility condition. */
function ListboxEmptyState({ children = "No items available" }: { children?: ReactNode }) {
  return (
    <EmptyState.Root
      size="sm"
      role="status"
      aria-live="polite"
    >
      <EmptyState.Content>
        <EmptyState.Description>{children}</EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

export interface SelectionSearchFieldProps extends Omit<SearchInputProps, "value" | "onClear"> {
  query: string;
  onQueryChange: (query: string) => void;
  endElement?: ReactNode;
}

export function SelectionSearchField({
  query,
  onQueryChange,
  endElement,
  onChange,
  placeholder,
  size = "sm",
  variant = "plain",
  ...props
}: SelectionSearchFieldProps) {
  return (
    <HStack
      gap="0"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <SearchInput
        aria-label={placeholder}
        {...props}
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
          onChange?.(event);
        }}
        onClear={() => onQueryChange("")}
        size={size}
        variant={variant}
      />
      {endElement}
    </HStack>
  );
}

interface ListboxSearchFieldProps extends SelectionSearchFieldProps {
  inputRef?: Ref<HTMLInputElement>;
}

export function ListboxSearchField({ inputRef, ...props }: ListboxSearchFieldProps) {
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

type ScrollToIndexRef = { current: ((index: number) => void) | undefined };

export const isVirtualized = <T, V extends SelectionValue>(
  controller: SelectionController<T, V>,
  virtual: boolean | undefined,
) => virtual === true && !controller.grouped;

export const getManagedRootProps = <T, V extends SelectionValue>(
  controller: SelectionController<T, V>,
  selectionMode: "single" | "multiple",
) => ({
  collection: controller.collection,
  value: controller.encodedValue,
  onValueChange: controller.handleValueChange,
  selectionMode,
  deselectable: selectionMode === "single" ? false : undefined,
});

// --- Simplified API ---

const VIRTUAL_ITEM_HEIGHT = 36;

export interface ListboxItemRenderProps<T, V extends SelectionValue> {
  item: T;
  index: number;
  state: SelectionItemState<V>;
}

interface ListboxManagedProps<T, V extends SelectionValue>
  extends SelectionItemsProps<T, V>, ManagedListOptions<T, V> {
  label?: string;
  search?: boolean | SelectionSearchOptions<T>;
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

export type ListboxProps<T = unknown, V extends SelectionValue = SelectionValue> = ListboxBaseProps<
  T,
  V
> &
  SelectionProps<V>;

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
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => VIRTUAL_ITEM_HEIGHT,
    overscan: 10,
    getItemKey,
  });

  // Expose scrollToIndex to the parent's Ark `scrollToIndexFn` (keyboard nav past the rendered window).
  useEffect(() => {
    scrollToIndexRef.current = (index) => virtualizer.scrollToIndex(index);
    return () => {
      scrollToIndexRef.current = undefined;
    };
  }, [virtualizer, scrollToIndexRef]);

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

interface ManagedListProps<T, V extends SelectionValue> extends ManagedListOptions<T, V> {
  controller: SelectionController<T, V>;
  contentProps?: HTMLStyledProps<"div">;
  scrollToIndexRef: ScrollToIndexRef;
}

export function ManagedList<T, V extends SelectionValue>({
  controller,
  loading,
  emptyMessage,
  indicatorPosition = "end",
  renderItem,
  renderItemActions,
  renderGroupLabel,
  getItemProps,
  listMaxHeight,
  contentProps,
  virtual,
  scrollToIndexRef,
}: ManagedListProps<T, V>) {
  const { collection, groups, grouped } = controller;
  // State, not a ref: the rows' layout effects run before this ancestor's ref attaches.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const renderRow = (item: T) => {
    const state = controller.getItemState(item);
    return (
      <Item
        key={collection.getItemValue(item)}
        item={item}
        {...getItemProps?.(item)}
      >
        <ItemText>{renderItem ? renderItem(item, state) : collection.stringifyItem(item)}</ItemText>
        {renderItemActions && <ItemActions>{renderItemActions(item, state)}</ItemActions>}
        {indicatorPosition !== "none" && <ItemIndicator />}
      </Item>
    );
  };

  const isEmpty = collection.items.length === 0;
  const emptyBlock = !loading && isEmpty && <ListboxEmptyState>{emptyMessage}</ListboxEmptyState>;
  const useVirtual = isVirtualized(controller, virtual);
  const listContentProps = useSearchFocusRetention(
    controller.search.inputRef,
    listMaxHeight == null ? contentProps : { ...contentProps, maxHeight: listMaxHeight },
  );

  const renderRows = () => {
    if (useVirtual) {
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
    <Content
      ref={setScrollElement}
      {...listContentProps}
    >
      {renderRows()}
      {emptyBlock}
    </Content>
  );
}

function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & SingleSelectionProps<V> & { ref?: Ref<HTMLDivElement> },
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxBaseProps<T, V> & MultipleSelectionProps<V> & { ref?: Ref<HTMLDivElement> },
): JSX.Element;
function ListboxSimple<T, V extends SelectionValue>(
  props: ListboxProps<T, V> & { ref?: Ref<HTMLDivElement> },
) {
  const {
    ref,
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    groupBy,
    groupSort,
    selectionMode = "single",
    value,
    onValueChange,
    label,
    search = true,
    contentCss,
    scrollToIndexFn,
    ...listboxProps
  } = props;
  const [listOptions, rest] = splitManagedListOptions<T, V, typeof listboxProps>(listboxProps);
  const controller = useSelectionController<T, V>({
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    groupBy,
    groupSort,
    selectionMode,
    value,
    onValueChange: onValueChange as (value: V | V[]) => unknown,
    search,
  });
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);

  return (
    <Root
      ref={ref}
      indicatorPosition={listOptions.indicatorPosition ?? "end"}
      {...rest}
      {...getManagedRootProps(controller, selectionMode)}
      scrollToIndexFn={
        isVirtualized(controller, listOptions.virtual)
          ? (details) => scrollToIndexRef.current?.(details.index)
          : scrollToIndexFn
      }
    >
      {label && <Label>{label}</Label>}
      {controller.search.showInput && (
        <ListboxSearchField
          inputRef={controller.search.inputRef}
          autoFocus={controller.search.autoFocus}
          placeholder={controller.search.placeholder}
          query={controller.search.query}
          onQueryChange={controller.search.setQuery}
          endElement={controller.search.endElement}
        />
      )}
      <ManagedList
        controller={controller}
        {...listOptions}
        contentProps={{ css: contentCss }}
        scrollToIndexRef={scrollToIndexRef}
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
  ItemIndicator,
  ItemText,
  Label,
  ValueText,
  Context: ListboxContext,
});
