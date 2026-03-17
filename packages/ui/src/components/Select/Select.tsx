import React, { useEffect, useMemo, useRef } from "react";
import type { BoxProps } from "styled-system/jsx";
import { HStack } from "styled-system/jsx";

import type { SelectButtonProps } from "../Buttons";
import { SelectButton } from "../Buttons";
import { EmptyState } from "../EmptyState";
import { SearchInput } from "../Input";
import { Listbox, useListCollection, type ListCollection, type ListboxProps } from "../Listbox";
import { Popover } from "../Popover";

export type SelectValue = string | number;

type PopoverContentProps = React.ComponentProps<typeof Popover.Content>;
type PopoverRootProps = React.ComponentProps<typeof Popover.Root>;

export interface SelectProps<T> {
  items: readonly T[];
  selected: SelectValue | SelectValue[] | undefined;
  onSelect: (item: T) => unknown;
  getValue: (item: T) => SelectValue;
  getLabel: (item: T) => string;
  renderLabel?: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  searchable?: boolean;
  renderActions?: (item: T) => React.ReactNode;
  searchExtra?: React.ReactNode;
  activeItemStyle?: "checkmark" | "none";
  triggerProps?: Partial<SelectButtonProps>;
  emptySelectionLabel?: string;
  getTriggerLabel?: (label: string) => string;
  contentProps?: Partial<PopoverContentProps>;
  contentWidth?: number;
  listContentProps?: BoxProps;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (value: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
  listboxProps?: Partial<ListboxProps>;
}

const minContentWidth = 140;

export const Select = <T,>({
  open,
  onOpenChange,
  triggerProps,
  emptySelectionLabel,
  getTriggerLabel,
  contentProps,
  contentWidth: controlledContentWidth,
  listContentProps,
  trigger,
  footer,
  onSelect,
  placement,
  items,
  selected,
  getValue,
  getLabel,
  renderLabel,
  searchPlaceholder = "Search...",
  searchable = true,
  renderActions,
  searchExtra,
  activeItemStyle = "checkmark",
  listboxProps,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMultiSelect = Array.isArray(selected);
  const buttonRef = useRef<HTMLButtonElement>(null);
  let adjContentWidth = controlledContentWidth ?? buttonRef.current?.clientWidth;

  if (adjContentWidth == null || adjContentWidth < minContentWidth)
    adjContentWidth = minContentWidth;

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
      const item = items.find((i) => getValue(i) === selectedItems[0]);
      return item ? getLabel(item) : "";
    }

    return emptySelectionLabel || `${selectedItems.length} Active`;
  }, [items, selectedItems, getValue, getLabel, emptySelectionLabel]);

  const controlledOpen = open != null ? open : isOpen;

  const handleOpenChange = (value: boolean) => {
    if (open != null) {
      if (onOpenChange != null) onOpenChange(value);
    } else setIsOpen(value);
  };

  const handleValueChange = (details: { value: string[] }) => {
    const newValue = details.value[details.value.length - 1];
    if (newValue == null) return;
    const item = items.find((i: T) => String(getValue(i)) === newValue);
    if (item) {
      onSelect(item);
      if (!isMultiSelect) handleOpenChange(false);
    }
  };

  return (
    <Popover.Root
      lazyMount
      open={controlledOpen}
      onOpenChange={({ open }) => handleOpenChange(open)}
      positioning={{ placement }}
    >
      <Popover.Trigger asChild>
        {trigger || (
          <SelectButton
            ref={buttonRef}
            {...triggerProps}
            hasValue={hasSelected}
            label={triggerProps?.label ?? (getTriggerLabel ? getTriggerLabel(label) : label)}
            sublabel={triggerProps?.sublabel}
          />
        )}
      </Popover.Trigger>

      <Popover.Content
        width={adjContentWidth}
        p="0"
        {...contentProps}
      >
        <Listbox.Root
          collection={collection as ListCollection<unknown>}
          value={selectedItems.map(String)}
          onValueChange={handleValueChange}
          selectionMode={isMultiSelect ? "multiple" : "single"}
          {...listboxProps}
        >
          {searchable && (
            <HStack
              gap="0"
              borderBottomWidth="1px"
              borderColor="border.default"
            >
              <SearchInput
                placeholder={searchPlaceholder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => filter(e.target.value)}
                size="sm"
                css={{ flex: 1 }}
              />
              {searchExtra}
            </HStack>
          )}
          <Listbox.Content {...listContentProps}>
            {collection.items.map((item) => (
              <Listbox.Item
                key={collection.getItemValue(item)}
                item={item}
              >
                <Listbox.ItemText>
                  {renderLabel ? renderLabel(item) : collection.stringifyItem(item)}
                </Listbox.ItemText>
                {renderActions?.(item)}
                {activeItemStyle === "checkmark" && <Listbox.ItemIndicator />}
              </Listbox.Item>
            ))}
            {collection.items.length === 0 && (
              <EmptyState.Root size="sm">
                <EmptyState.Content>
                  <EmptyState.Description>No items available</EmptyState.Description>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </Listbox.Content>
        </Listbox.Root>
        {footer}
      </Popover.Content>
    </Popover.Root>
  );
};
