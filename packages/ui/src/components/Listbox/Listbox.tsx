import { Listbox as ArkListbox, ListboxContext } from "@ark-ui/react/listbox";
import { Box, type HTMLStyledProps, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { type ListboxVariantProps, listbox } from "@construkt-kit/styled-system/recipes";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type JSX,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { WithRef } from "../../types";
import { EmptyState } from "../EmptyState";
import { SearchInput } from "../Input";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";
import type {
  SelectionIndicatorPosition,
  SelectionItemsProps,
  SelectionItemState,
  SelectionProps,
  SelectionSearchOptions,
  SelectionValue,
  SingleSelectionProps,
  MultipleSelectionProps,
} from "./types";
import { type SelectionController, useSelectionController } from "./useSelectionController";

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
const StyledItem = withContext(ArkListbox.Item, "item");
const ItemGroup = withContext(ArkListbox.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkListbox.ItemGroupLabel, "itemGroupLabel");
const ItemText = withContext(ArkListbox.ItemText, "itemText");
const Label = withContext(ArkListbox.Label, "label");
const ValueText = withContext(ArkListbox.ValueText, "valueText");

const StyledItemIndicator = withContext(ArkListbox.ItemIndicator, "itemIndicator");
export const LISTBOX_ACTION_ATTRIBUTE = "data-listbox-item-action";
const INTERACTIVE_ITEM_SELECTOR = [
  `[${LISTBOX_ACTION_ATTRIBUTE}]`,
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[contenteditable='true']",
].join(", ");

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

function isEventFromItemAction(event: MouseEvent<HTMLDivElement>) {
  const target = event.target;

  return target instanceof HTMLElement && target.closest(INTERACTIVE_ITEM_SELECTOR) !== null;
}

function stopItemSelection(event: MouseEvent<HTMLDivElement>) {
  if (!isEventFromItemAction(event)) return;

  event.stopPropagation();
}

function callItemHandlers(
  event: MouseEvent<HTMLDivElement>,
  handler?: MouseEventHandler<HTMLDivElement>,
) {
  stopItemSelection(event);
  handler?.(event);
}

type ItemProps = ComponentProps<typeof StyledItem>;

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

function Item({ ref, onMouseDown, onClick, ...props }: WithRef<ItemProps, HTMLDivElement>) {
  return (
    <StyledItem
      ref={ref}
      {...props}
      onMouseDown={(event) => callItemHandlers(event, onMouseDown)}
      onClick={(event) => callItemHandlers(event, onClick)}
    />
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

// --- Simplified API ---

const VIRTUAL_ITEM_HEIGHT = 36;
const VIRTUAL_DEFAULT_MAX_HEIGHT = "20rem";

export interface ListboxItemRenderProps<T, V extends SelectionValue> {
  item: T;
  index: number;
  state: SelectionItemState<V>;
}

type ManagedItemProps = Partial<Omit<ComponentProps<typeof Item>, "children" | "item">>;

interface ListboxManagedProps<T, V extends SelectionValue> extends SelectionItemsProps<T, V> {
  label?: string;
  search?: boolean | SelectionSearchOptions<T>;
  emptyMessage?: ReactNode;
  loading?: boolean;
  indicatorPosition?: SelectionIndicatorPosition;
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  getItemProps?: (item: T) => ManagedItemProps;
  contentProps?: HTMLStyledProps<"div">;
  virtual?: boolean;
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
  scrollToIndexRef: { current: ((index: number) => void) | undefined };
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

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  // Rows sit in normal flow and self-measure via `measureElement`, so variable heights (size
  // variants, multi-line items) are respected instead of being clamped to the estimate.
  return (
    <Content
      ref={scrollRef}
      {...contentProps}
      maxHeight={contentProps?.maxHeight ?? VIRTUAL_DEFAULT_MAX_HEIGHT}
    >
      <Box style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
        {virtualItems.map((virtualItem) => (
          <Box
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
          >
            {renderRow(items[virtualItem.index], virtualItem.index)}
          </Box>
        ))}
      </Box>
    </Content>
  );
}

interface ManagedListProps<T, V extends SelectionValue> {
  controller: SelectionController<T, V>;
  loading?: boolean;
  emptyMessage?: ReactNode;
  indicatorPosition?: SelectionIndicatorPosition;
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  getItemProps?: (item: T) => ManagedItemProps;
  contentProps?: HTMLStyledProps<"div">;
  virtual?: boolean;
  scrollToIndexRef?: { current: ((index: number) => void) | undefined };
}

export function ManagedList<T, V extends SelectionValue>({
  controller,
  loading,
  emptyMessage = "No items available",
  indicatorPosition = "end",
  renderItem,
  renderItemActions,
  getItemProps,
  contentProps,
  virtual,
  scrollToIndexRef: providedScrollToIndexRef,
}: ManagedListProps<T, V>) {
  const { collection } = controller;
  const renderRow = (item: T, index: number) => {
    const state = controller.getItemState(item);
    return (
      <Item
        key={collection.getItemValue(item) ?? index}
        item={item}
        {...getItemProps?.(item)}
      >
        <ItemText>{renderItem ? renderItem(item, state) : collection.stringifyItem(item)}</ItemText>
        {renderItemActions && <ItemActions>{renderItemActions(item, state)}</ItemActions>}
        {indicatorPosition !== "none" && <ItemIndicator />}
      </Item>
    );
  };

  const grouped = useMemo(() => collection.group?.() ?? [], [collection]);
  const isGrouped = grouped.length > 0 && grouped[0]?.[0] != null && grouped[0][0] !== "";
  const isEmpty = collection.items.length === 0;
  const emptyBlock = !loading && isEmpty && <ListboxEmptyState>{emptyMessage}</ListboxEmptyState>;
  const useVirtual = virtual === true && !isGrouped;
  const internalScrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const scrollToIndexRef = providedScrollToIndexRef ?? internalScrollToIndexRef;

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
    <Content {...contentProps}>
      {isGrouped
        ? grouped.map(([group, groupItems]) => (
            <ItemGroup key={String(group)}>
              <ItemGroupLabel>{String(group)}</ItemGroupLabel>
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
    selectionMode = "single",
    value,
    onValueChange,
    label,
    search,
    emptyMessage,
    loading,
    indicatorPosition = "end",
    renderItem,
    renderItemActions,
    getItemProps,
    contentProps,
    virtual,
    ...rest
  } = props;
  const controller = useSelectionController<T, V>({
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    selectionMode,
    value,
    onValueChange: onValueChange as (value: V | V[] | null) => unknown,
    search,
    searchDefaultEnabled: true,
  });
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);

  return (
    <Root
      ref={ref}
      collection={controller.collection}
      value={controller.encodedValue}
      onValueChange={controller.handleValueChange}
      selectionMode={selectionMode}
      deselectable={selectionMode === "single" ? false : undefined}
      indicatorPosition={indicatorPosition}
      {...rest}
      scrollToIndexFn={
        virtual ? (details) => scrollToIndexRef.current?.(details.index) : rest.scrollToIndexFn
      }
    >
      {label && <Label>{label}</Label>}
      {controller.search.showInput && (
        <Box
          borderBottomWidth="1px"
          borderColor="border"
        >
          <SearchInput
            autoFocus={controller.search.autoFocus}
            aria-label={controller.search.placeholder}
            placeholder={controller.search.placeholder}
            value={controller.search.query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              controller.search.setQuery(event.target.value)
            }
            onClear={() => controller.search.setQuery("")}
            size="sm"
            variant="plain"
          />
          {controller.search.endElement}
        </Box>
      )}
      <ManagedList
        controller={controller}
        loading={loading}
        emptyMessage={emptyMessage}
        indicatorPosition={indicatorPosition}
        renderItem={renderItem}
        renderItemActions={renderItemActions}
        getItemProps={getItemProps}
        contentProps={contentProps}
        virtual={virtual}
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
