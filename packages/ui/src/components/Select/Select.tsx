import { type JSX, type ReactNode, useMemo, useRef, useState } from "react";

import { Listbox } from "../Listbox/Listbox";
import type {
  MultipleSelectionProps,
  SelectionValue,
  SingleSelectionProps,
} from "../Listbox/types";
import {
  type SelectionController,
  useSelectionController,
} from "../Listbox/useSelectionController";
import { SelectContext, type SelectContextValue } from "./Select.context";
import {
  SelectContent,
  SelectEmptyState,
  SelectFooter,
  SelectItem,
  SelectItemActions,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPopover,
  SelectSearch,
  SelectTrigger,
} from "./Select.parts";
import type { SelectProps, SelectRootProps, SelectSimpleProps } from "./Select.types";

export type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemActionsProps,
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

function getDefaultValueLabel<T, V extends SelectionValue>(
  selectedValues: readonly V[],
  selectedItems: readonly T[],
  getItemLabel: (item: T) => string,
  placeholder: ReactNode,
): ReactNode {
  if (selectedValues.length === 0) return placeholder;
  if (selectedValues.length === 1) {
    return selectedItems[0] == null ? "1 selected" : getItemLabel(selectedItems[0]);
  }
  return `${selectedValues.length} selected`;
}

function SelectRoot<T, V extends SelectionValue>(props: SelectRootProps<T, V>) {
  const {
    actionsVisibility,
    children,
    contentWidth,
    defaultOpen = false,
    emptyMessage,
    getItemLabel,
    getItemProps,
    getItemValue,
    indicatorPosition = "end",
    isItemDisabled,
    items,
    listboxProps,
    loading,
    matchTriggerWidth = true,
    onOpenChange,
    open,
    placeholder = "Select item",
    placement,
    renderItem,
    renderItemActions,
    renderValue,
    search,
    selectionMode = "single",
    value,
    virtual,
    onValueChange,
  } = props;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);

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
    selectionMode,
    value,
    onValueChange: (nextValue) => {
      (onValueChange as (value: V | V[] | null) => unknown)(nextValue);
      if (selectionMode === "single") handleOpenChange(false);
    },
    search,
  });

  const triggerValue = renderValue
    ? renderValue({ value, selectedItems: controller.selectedItems })
    : getDefaultValueLabel(
        controller.selectedValues,
        controller.selectedItems,
        getItemLabel,
        placeholder,
      );

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      controller: controller as SelectionController<unknown, SelectionValue>,
      contentWidth,
      matchTriggerWidth,
      indicatorPosition,
      placeholder,
      triggerValue,
      hasValue: controller.selectedValues.length > 0,
      loading,
      emptyMessage,
      virtual,
      scrollToIndexRef,
      renderItem: renderItem as SelectContextValue["renderItem"],
      renderItemActions: renderItemActions as SelectContextValue["renderItemActions"],
      getItemProps: getItemProps as SelectContextValue["getItemProps"],
    }),
    [
      contentWidth,
      controller,
      emptyMessage,
      getItemProps,
      indicatorPosition,
      loading,
      matchTriggerWidth,
      placeholder,
      renderItem,
      renderItemActions,
      triggerValue,
      virtual,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <SelectPopover
        open={resolvedOpen}
        onOpenChange={handleOpenChange}
        placement={placement}
        matchTriggerWidth={matchTriggerWidth}
        contentWidth={contentWidth}
      >
        <Listbox.Root
          {...listboxProps}
          actionsVisibility={actionsVisibility}
          indicatorPosition={indicatorPosition}
          collection={controller.collection}
          value={controller.encodedValue}
          onValueChange={controller.handleValueChange}
          selectionMode={selectionMode}
          deselectable={selectionMode === "single" ? false : undefined}
          scrollToIndexFn={
            virtual
              ? (details) => scrollToIndexRef.current?.(details.index)
              : listboxProps?.scrollToIndexFn
          }
        >
          {children}
        </Listbox.Root>
      </SelectPopover>
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
  search,
  ...rootProps
}: SelectProps<T, V>) {
  return (
    <SelectRoot
      {...rootProps}
      search={search}
    >
      <SelectTrigger {...triggerProps} />
      <SelectContent {...contentProps}>
        {search !== false && search != null && <SelectSearch />}
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
  Search: SelectSearch,
  List: SelectList,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  ItemActions: SelectItemActions,
  EmptyState: SelectEmptyState,
  Footer: SelectFooter,
});
