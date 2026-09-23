import { Listbox as ArkListbox, ListboxContext } from "@ark-ui/react/listbox";
import {
  Box,
  HStack,
  type HTMLStyledProps,
  createStyleContext,
} from "@construkt-kit/styled-system/jsx";
import { type ListboxVariantProps, listbox } from "@construkt-kit/styled-system/recipes";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  type ComponentProps,
  type JSX,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useRef,
} from "react";

import type { WithRef } from "../../types";
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

const { withProvider, withContext } = createStyleContext(listbox);

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
  scrollAreaProps?: Omit<ScrollAreaProps, "children">;
};

function Content({
  ref,
  children,
  scrollAreaProps,
  ...props
}: WithRef<ContentProps, HTMLDivElement>) {
  const { contentProps, ...resolvedScrollAreaProps } = scrollAreaProps ?? {};

  return (
    <ScrollArea.Root {...resolvedScrollAreaProps}>
      <ScrollArea.Viewport
        asChild
        role="listbox"
      >
        <StyledContent
          ref={ref}
          {...props}
        >
          <ScrollArea.Content
            {...contentProps}
            style={{
              minWidth: "100%",
              width: "100%",
              ...contentProps?.style,
            }}
          >
            {children}
          </ScrollArea.Content>
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
const VIRTUAL_DEFAULT_MAX_HEIGHT = "20rem";

export interface ListboxItemRenderProps<T, V extends SelectionValue> {
  item: T;
  index: number;
  state: SelectionItemState<V>;
}

interface ListboxManagedProps<T, V extends SelectionValue>
  extends SelectionItemsProps<T, V>, ManagedListOptions<T, V> {
  label?: string;
  search?: boolean | SelectionSearchOptions<T>;
  contentProps?: HTMLStyledProps<"div">;
}

type ListboxBaseProps<T, V extends SelectionValue> = Omit<
  ArkListbox.RootComponentProps<T, RootProps>,
  | "activeItemStyle"
  | "children"
  | "collection"
  | "deselectable"
  | "onValueChange"
  | "selectionMode"
  | "value"
> &
  ListboxManagedProps<T, V>;

export type ListboxProps<T = unknown, V extends SelectionValue = SelectionValue> = ListboxBaseProps<
  T,
  V
> &
  SelectionProps<V>;

// Mounted only in virtual mode, so `useVirtualizer` never runs for plain lists.
function VirtualList<T>({
  items,
  renderRow,
  contentProps,
  getItemKey,
  scrollToIndexRef,
}: {
  items: T[];
  renderRow: (item: T, index: number) => ReactNode;
  contentProps?: HTMLStyledProps<"div">;
  getItemKey: (index: number) => string | number;
  scrollToIndexRef: ScrollToIndexRef;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
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
    <Content
      ref={scrollRef}
      {...contentProps}
      maxHeight={contentProps?.maxHeight ?? VIRTUAL_DEFAULT_MAX_HEIGHT}
    >
      <VirtualRows virtualizer={virtualizer}>
        {(virtualItem) => renderRow(items[virtualItem.index], virtualItem.index)}
      </VirtualRows>
    </Content>
  );
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
  contentProps,
  virtual,
  scrollToIndexRef,
}: ManagedListProps<T, V>) {
  const { collection, groups, grouped } = controller;
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
  const resolvedContentProps =
    virtual === true && grouped
      ? { maxHeight: VIRTUAL_DEFAULT_MAX_HEIGHT, ...contentProps }
      : contentProps;

  if (useVirtual) {
    if (isEmpty) return emptyBlock;
    return (
      <VirtualList
        items={collection.items}
        renderRow={renderRow}
        contentProps={contentProps}
        getItemKey={(index) => collection.getItemValue(collection.items[index]) ?? index}
        scrollToIndexRef={scrollToIndexRef}
      />
    );
  }

  return (
    <Content {...resolvedContentProps}>
      {grouped
        ? groups.map(([group, groupItems]) => (
            <ItemGroup key={group}>
              {group !== "" && (
                <ItemGroupLabel>
                  {renderGroupLabel ? renderGroupLabel(group, groupItems) : group}
                </ItemGroupLabel>
              )}
              {groupItems.map(renderRow)}
            </ItemGroup>
          ))
        : collection.items.map(renderRow)}
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
    contentProps,
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
    onValueChange: onValueChange as (value: V | V[] | null) => unknown,
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
        <SelectionSearchField
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
        contentProps={contentProps}
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
