import { Box, HStack } from "@construkt-kit/styled-system/jsx";
import React, { createContext, useContext, useEffect, useMemo } from "react";

import type { SelectButtonProps } from "../Buttons";
import { SelectButton } from "../Buttons";
import { EmptyState } from "../EmptyState";
import { SearchInput } from "../Input";
import { type ListCollection, Listbox, type ListboxProps, useListCollection } from "../Listbox";
import { Popover } from "../Popover";

export type SelectValue = string | number;

type PopoverContentProps = React.ComponentProps<typeof Popover.Content>;
type PopoverRootProps = React.ComponentProps<typeof Popover.Root>;

interface SelectContextValue<T> {
  activeItemStyle: "checkmark" | "none";
  collection: ListCollection<T>;
  contentWidth: number | undefined;
  filter: (value: string) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => SelectValue;
  hasSelected: boolean;
  isMultiSelect: boolean;
  triggerLabel: string;
}

const SelectContext = createContext<SelectContextValue<unknown> | null>(null);
const SelectItemContext = createContext<unknown | null>(null);

const useSelectContext = <T,>() => {
  const context = useContext(SelectContext);

  if (context == null)
    throw new Error("Select compound components must be used within Select.Root");

  return context as SelectContextValue<T>;
};

const useSelectItemContext = <T,>() => useContext(SelectItemContext) as T | null;

export interface SelectRootProps<T> {
  items: readonly T[];
  selected: SelectValue | SelectValue[] | undefined;
  onSelect: (item: T) => unknown;
  getValue: (item: T) => SelectValue;
  getLabel: (item: T) => string;
  emptySelectionLabel?: string;
  getTriggerLabel?: (label: string) => string;
  activeItemStyle?: "checkmark" | "none";
  contentWidth?: number;
  matchTriggerWidth?: boolean;
  open?: boolean;
  onOpenChange?: (value: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
  listboxProps?: Partial<ListboxProps>;
  children: React.ReactNode;
}

export interface SelectTriggerProps extends Partial<SelectButtonProps> {
  children?: React.ReactNode;
}

type SearchInputProps = React.ComponentProps<typeof SearchInput>;

export interface SelectSearchProps extends Omit<SearchInputProps, "onChange"> {
  children?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export type SelectContentProps = Partial<PopoverContentProps>;
export type SelectListProps = React.ComponentProps<typeof Listbox.Content>;

export interface SelectItemsProps<T> {
  children: (item: T) => React.ReactNode;
}

export interface SelectItemProps<T> extends Omit<
  React.ComponentProps<typeof Listbox.Item>,
  "item"
> {
  item: T;
}

export type SelectItemTextProps = React.ComponentProps<typeof Listbox.ItemText>;
export type SelectItemIndicatorProps = React.ComponentProps<typeof Listbox.ItemIndicator>;

export interface SelectEmptyStateProps {
  children?: React.ReactNode;
}

export type SelectFooterProps = React.ComponentProps<typeof Box>;

const minContentWidth = 140;

export const SelectRoot = <T,>({
  activeItemStyle = "checkmark",
  children,
  contentWidth: controlledContentWidth,
  emptySelectionLabel,
  getLabel,
  getTriggerLabel,
  getValue,
  items,
  listboxProps,
  matchTriggerWidth = true,
  onOpenChange,
  onSelect,
  open,
  placement,
  selected,
}: SelectRootProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMultiSelect = Array.isArray(selected);

  const selectedItems = useMemo(
    () => (selected == null ? [] : Array.isArray(selected) ? selected : [selected]),
    [selected],
  );

  const { collection, filter, set } = useListCollection<T>({
    initialItems: items as T[],
    itemToString: (item: T) => getLabel(item),
    itemToValue: (item: T) => String(getValue(item)),
    filter: (itemText: string, filterText: string) =>
      itemText.toLowerCase().includes(filterText.toLowerCase()),
  });

  useEffect(() => {
    set(items as T[]);
  }, [items, set]);

  const hasSelected = selectedItems.length > 0;

  const label = useMemo(() => {
    if (selectedItems.length === 1) {
      const item = items.find((entry) => getValue(entry) === selectedItems[0]);
      return item ? getLabel(item) : "";
    }

    return emptySelectionLabel || `${selectedItems.length} Active`;
  }, [emptySelectionLabel, getLabel, getValue, items, selectedItems]);

  const controlledOpen = open != null ? open : isOpen;

  const handleOpenChange = (value: boolean) => {
    if (open != null) {
      if (onOpenChange != null) onOpenChange(value);
      return;
    }

    setIsOpen(value);
  };

  const handleValueChange = (details: { value: string[] }) => {
    const prevValues = selectedItems.map(String);
    const newValues = details.value;
    const changedValue =
      newValues.find((value) => !prevValues.includes(value)) ??
      prevValues.find((value) => !newValues.includes(value));

    if (changedValue == null) return;

    const item = items.find((entry: T) => String(getValue(entry)) === changedValue);

    if (item == null) return;

    onSelect(item);

    if (!isMultiSelect) handleOpenChange(false);
  };

  const contextValue = useMemo<SelectContextValue<T>>(
    () => ({
      activeItemStyle,
      collection,
      contentWidth: controlledContentWidth,
      filter,
      getLabel,
      getValue,
      hasSelected,
      isMultiSelect,
      triggerLabel: getTriggerLabel ? getTriggerLabel(label) : label,
    }),
    [
      activeItemStyle,
      collection,
      controlledContentWidth,
      filter,
      getLabel,
      getTriggerLabel,
      getValue,
      hasSelected,
      isMultiSelect,
      label,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue as SelectContextValue<unknown>}>
      <Popover.Root
        lazyMount
        open={controlledOpen}
        onOpenChange={({ open: nextOpen }) => handleOpenChange(nextOpen)}
        positioning={{
          placement,
          sameWidth: matchTriggerWidth && controlledContentWidth == null,
        }}
      >
        <Listbox.Root
          {...listboxProps}
          collection={collection as ListCollection<unknown>}
          value={selectedItems.map(String)}
          onValueChange={handleValueChange}
          selectionMode={isMultiSelect ? "multiple" : "single"}
        >
          {children}
        </Listbox.Root>
      </Popover.Root>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, ...props }: SelectTriggerProps) => {
  const { hasSelected, triggerLabel } = useSelectContext<unknown>();

  return (
    <Popover.Trigger asChild>
      {children ?? (
        <SelectButton
          {...props}
          hasValue={props.hasValue ?? hasSelected}
          label={props.label ?? triggerLabel}
          sublabel={props.sublabel}
        />
      )}
    </Popover.Trigger>
  );
};

export const SelectContent = ({ children, ...props }: SelectContentProps) => {
  const { contentWidth } = useSelectContext<unknown>();

  return (
    <Popover.Content
      minW={minContentWidth}
      {...(contentWidth != null ? { width: contentWidth } : {})}
      p="0"
      {...props}
    >
      {children}
    </Popover.Content>
  );
};

export const SelectSearch = ({
  children,
  css,
  onChange,
  placeholder = "Search...",
  size = "sm",
  variant = "plain",
  ...props
}: SelectSearchProps) => {
  const { filter } = useSelectContext<unknown>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filter(event.target.value);
    onChange?.(event);
  };

  return (
    <HStack
      gap="0"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <SearchInput
        {...props}
        placeholder={placeholder}
        onChange={handleChange}
        size={size}
        css={{ flex: 1, ...css }}
        variant={variant}
      />
      {children}
    </HStack>
  );
};

export const SelectList = ({ children, ...props }: SelectListProps) => (
  <Listbox.Content {...props}>{children}</Listbox.Content>
);

export const SelectItems = <T,>({ children }: SelectItemsProps<T>) => {
  const { collection } = useSelectContext<T>();

  return <>{collection.items.map((item) => children(item))}</>;
};

export const SelectItem = <T,>({ children, item, ...props }: SelectItemProps<T>) => (
  <SelectItemContext.Provider value={item}>
    <Listbox.Item
      {...props}
      item={item}
    >
      {children}
    </Listbox.Item>
  </SelectItemContext.Provider>
);

export const SelectItemText = ({ children, ...props }: SelectItemTextProps) => {
  const { collection } = useSelectContext<unknown>();
  const item = useSelectItemContext<unknown>();

  return (
    <Listbox.ItemText {...props}>
      {children ?? (item != null ? collection.stringifyItem(item) : null)}
    </Listbox.ItemText>
  );
};

export const SelectItemIndicator = (props: SelectItemIndicatorProps) => {
  const { activeItemStyle } = useSelectContext<unknown>();

  if (activeItemStyle === "none") return null;

  return <Listbox.ItemIndicator {...props} />;
};

export const SelectEmptyState = ({ children = "No items available" }: SelectEmptyStateProps) => {
  const { collection } = useSelectContext<unknown>();

  if (collection.items.length > 0) return null;

  return (
    <EmptyState.Root size="sm">
      <EmptyState.Content>
        <EmptyState.Description>{children}</EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  );
};

export const SelectFooter = ({ children, ...props }: SelectFooterProps) => (
  <Box {...props}>{children}</Box>
);

// --- Simple API ---

export interface SelectProps<T> extends Omit<SelectRootProps<T>, "children"> {
  /** Label displayed on the trigger button */
  label?: string;
  /** Placeholder for the search input (enables search when set) */
  searchPlaceholder?: string;
  /** Extra content rendered next to the search input */
  searchExtra?: React.ReactNode;
  /** Content displayed when the collection is empty */
  emptyMessage?: React.ReactNode;
  /** Render custom content after each item's text */
  renderActions?: (item: T) => React.ReactNode;
  /** Render custom item content (replaces default ItemText + ItemIndicator) */
  renderItem?: (item: T) => React.ReactNode;
  /** Props forwarded to the trigger button */
  triggerProps?: Partial<SelectTriggerProps>;
  /** Props forwarded to the content popover */
  contentProps?: Partial<SelectContentProps>;
  /** Props forwarded to the list container */
  listProps?: Partial<SelectListProps>;
  /** Content rendered below the list */
  footer?: React.ReactNode;
  /** Override children for full compound control inside SelectRoot */
  children?: React.ReactNode;
}

const SelectSimple = <T,>({
  label,
  searchPlaceholder,
  searchExtra,
  emptyMessage,
  renderActions,
  renderItem,
  triggerProps,
  contentProps,
  listProps,
  footer,
  children,
  ...rootProps
}: SelectProps<T>) => (
  <SelectRoot {...rootProps}>
    {children ?? (
      <>
        <SelectTrigger
          {...triggerProps}
          label={triggerProps?.label ?? label}
        />
        <SelectContent {...contentProps}>
          {searchPlaceholder && (
            <SelectSearch placeholder={searchPlaceholder}>{searchExtra}</SelectSearch>
          )}
          <SelectList {...listProps}>
            <SelectItems<T>>
              {(item) => (
                <SelectItem
                  key={String(rootProps.getValue(item))}
                  item={item}
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <>
                      <SelectItemText />
                      {renderActions?.(item)}
                      <SelectItemIndicator />
                    </>
                  )}
                </SelectItem>
              )}
            </SelectItems>
            <SelectEmptyState>{emptyMessage}</SelectEmptyState>
          </SelectList>
          {footer && <SelectFooter>{footer}</SelectFooter>}
        </SelectContent>
      </>
    )}
  </SelectRoot>
);

export const Select = Object.assign(SelectSimple, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Search: SelectSearch,
  List: SelectList,
  Items: SelectItems,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  EmptyState: SelectEmptyState,
  Footer: SelectFooter,
});
