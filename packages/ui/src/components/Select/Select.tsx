import { type JSX, useRef, useState } from "react";

import { Listbox } from "../Listbox/Listbox";
import {
  type SelectionController,
  getManagedRootProps,
  getSelectionLabel,
  isVirtualized,
  splitManagedListOptions,
  useSelectionController,
} from "../Listbox/managed";
import type {
  ManagedListOptions,
  MultipleSelectionProps,
  SelectionValue,
  SingleSelectionProps,
} from "../Listbox/types";
import { Popover } from "../Popover";
import { SelectContext, type SelectContextValue } from "./Select.context";
import {
  SelectContent,
  SelectFooter,
  SelectList,
  SelectSearch,
  SelectTrigger,
  selectListParts,
} from "./Select.parts";
import type { SelectProps, SelectRootProps, SelectSimpleProps } from "./Select.types";

export type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemActionsProps,
  SelectItemGroupLabelProps,
  SelectItemGroupProps,
  SelectItemIndicatorProps,
  SelectItemProps,
  SelectItemTextProps,
  SelectListProps,
  SelectProps,
  SelectRootProps,
  SelectSearchProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select.types";

function SelectRoot<T, V extends SelectionValue>(props: SelectRootProps<T, V>) {
  const [listOptions, rootProps] = splitManagedListOptions<T, V, SelectRootProps<T, V>>(props);
  const {
    actionsVisibility,
    children,
    contentWidth,
    defaultOpen = false,
    getItemLabel,
    getItemValue,
    groupBy,
    groupSort,
    isItemDisabled,
    items,
    listboxProps,
    matchTriggerWidth = true,
    onOpenChange,
    open,
    placeholder = "Select item",
    placement,
    renderValue,
    search,
    selectionMode = "single",
    value,
    onValueChange,
  } = rootProps;
  const list: ManagedListOptions<T, V> = {
    ...listOptions,
    indicatorPosition: listOptions.indicatorPosition ?? "end",
  };
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const sameWidth = matchTriggerWidth && contentWidth == null;

  function handleOpenChange(nextOpen: boolean) {
    if (open == null) setInternalOpen(nextOpen);
    if (!nextOpen) controller.search.reset();
    onOpenChange?.(nextOpen);
  }

  const controller = useSelectionController<T, V>({
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    groupBy,
    groupSort,
    selectionMode,
    value,
    onValueChange: (nextValue) => {
      (onValueChange as (value: V | V[] | null) => unknown)(nextValue);
      if (selectionMode === "single") handleOpenChange(false);
    },
    search,
  });

  const contextValue: SelectContextValue = {
    controller: controller as SelectionController<unknown, SelectionValue>,
    list: list as SelectContextValue["list"],
    contentWidth,
    sameWidth,
    triggerValue: renderValue
      ? renderValue({ value, selectedItems: controller.selectedItems })
      : getSelectionLabel(
          controller.selectedValues.length,
          controller.selectedItems,
          getItemLabel,
          placeholder,
        ),
    hasValue: controller.selectedValues.length > 0,
    scrollToIndexRef,
    close: () => handleOpenChange(false),
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <Popover.Root
        open={resolvedOpen}
        onOpenChange={({ open: nextOpen }) => handleOpenChange(nextOpen)}
        positioning={{ placement, sameWidth }}
      >
        <Listbox.Root
          {...listboxProps}
          actionsVisibility={actionsVisibility}
          indicatorPosition={list.indicatorPosition}
          {...getManagedRootProps(controller, selectionMode)}
          scrollToIndexFn={
            isVirtualized(controller, list.virtual)
              ? (details) => scrollToIndexRef.current?.(details.index)
              : listboxProps?.scrollToIndexFn
          }
        >
          {children}
        </Listbox.Root>
      </Popover.Root>
    </SelectContext.Provider>
  );
}

function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & SingleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & MultipleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>({
  triggerProps,
  contentProps,
  listProps,
  footer,
  ...rootProps
}: SelectProps<T, V>) {
  return (
    <SelectRoot {...rootProps}>
      <SelectTrigger {...triggerProps} />
      <SelectContent {...contentProps}>
        <SelectSearch />
        <SelectList {...listProps} />
        {footer != null && <SelectFooter>{footer}</SelectFooter>}
      </SelectContent>
    </SelectRoot>
  );
}

export const Select = Object.assign(SelectSimple, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  ...selectListParts,
});
