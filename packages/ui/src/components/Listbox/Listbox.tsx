import type { CollectionItem } from "@ark-ui/react/collection";
import { Listbox as ArkListbox, ListboxContext } from "@ark-ui/react/listbox";
import { type HTMLStyledProps, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { type ListboxVariantProps, listbox } from "@construkt-kit/styled-system/recipes";
import { CheckIcon } from "lucide-react";
import type {
  ChangeEvent,
  ComponentProps,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  SyntheticEvent,
} from "react";

import type { WithRef } from "../../types";
import { EmptyState } from "../EmptyState";
import { SearchInput } from "../Input";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";

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
const LISTBOX_ACTION_ATTRIBUTE = "data-listbox-item-action";
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

  event.preventDefault();
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
      <ScrollArea.Viewport asChild>
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

function ItemActions({ children }: { children: ReactNode }) {
  const stopPropagation = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      data-listbox-item-action=""
      onPointerDownCapture={stopPropagation}
      onMouseDownCapture={stopPropagation}
      onClick={stopPropagation}
    >
      {children}
    </div>
  );
}

// --- Simplified API ---

export interface ListboxProps<
  T extends CollectionItem = CollectionItem,
> extends ArkListbox.RootComponentProps<T, RootProps> {
  /** Label text displayed above the list */
  label?: string;
  /** Placeholder for the search input (enables search when set) */
  searchPlaceholder?: string;
  /** Called when the search input value changes */
  onSearchChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Content displayed when the collection is empty */
  emptyMessage?: ReactNode;
  /** Render custom content after each item's text */
  renderActions?: (item: T) => ReactNode;
}

function ListboxSimple<T extends CollectionItem>({
  ref,
  label,
  searchPlaceholder,
  onSearchChange,
  emptyMessage = "No items available",
  renderActions,
  children,
  ...rest
}: WithRef<ListboxProps<T>>) {
  const collection = rest.collection;
  const grouped = collection.group?.() ?? [];
  const isGrouped = grouped.length > 0 && grouped[0]?.[0] !== undefined;

  return (
    <Root
      ref={ref}
      {...rest}
    >
      {label && <Label>{label}</Label>}
      {children ?? (
        <>
          {searchPlaceholder && (
            <Input asChild>
              <SearchInput
                placeholder={searchPlaceholder}
                onChange={onSearchChange}
                size="sm"
              />
            </Input>
          )}
          <Content>
            {isGrouped
              ? grouped.map(([group, items]) => (
                  <ItemGroup key={String(group)}>
                    <ItemGroupLabel>{String(group)}</ItemGroupLabel>
                    {items.map((item) => (
                      <Item
                        key={collection.getItemValue(item)}
                        item={item}
                      >
                        <ItemText>{collection.stringifyItem(item)}</ItemText>
                        {renderActions && <ItemActions>{renderActions(item)}</ItemActions>}
                        <ItemIndicator />
                      </Item>
                    ))}
                  </ItemGroup>
                ))
              : collection.items.map((item) => (
                  <Item
                    key={collection.getItemValue(item)}
                    item={item}
                  >
                    <ItemText>{collection.stringifyItem(item)}</ItemText>
                    {renderActions && <ItemActions>{renderActions(item)}</ItemActions>}
                    <ItemIndicator />
                  </Item>
                ))}
            {collection.items.length === 0 && (
              <EmptyState.Root size="sm">
                <EmptyState.Content>
                  <EmptyState.Description>{emptyMessage}</EmptyState.Description>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </Content>
        </>
      )}
    </Root>
  );
}

export type ListboxRootProps = RootProps;

export const Listbox = Object.assign(ListboxSimple, {
  Root,
  RootProvider,
  Content,
  Empty,
  Input,
  Item,
  ItemGroup,
  ItemGroupLabel,
  ItemIndicator,
  ItemText,
  Label,
  ValueText,
  Context: ListboxContext,
});
