import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";

import { splitCssProps } from "#styled-system/jsx";

import {
  ListboxRootImpl,
  type ManagedListbox,
  splitManagedListOptions,
  useListboxContext,
  useManagedListbox,
} from "../Listbox/managed";
import type { ManagedListOptions, SelectionMode, SelectionValue } from "../Listbox/types";
import { useRevealSelection } from "../Listbox/useRevealSelection";
import { Popover, usePopoverContext } from "../Popover/Popover";
import { SelectContext, type SelectContextValue } from "./Select.context";
import type { SelectRootProps } from "./Select.types";

function getSelectionLabel<T>(
  selectedCount: number,
  selectedItems: readonly T[],
  getItemLabel: (item: T) => string,
  placeholder: ReactNode,
): ReactNode {
  if (selectedCount === 0) return placeholder;
  if (selectedCount === 1) {
    return selectedItems[0] == null ? "1 selected" : getItemLabel(selectedItems[0]);
  }
  return `${selectedCount} selected`;
}

// The list outlives the content, which mounts per open, so each open starts without a highlight.
function SelectHighlightSync({ query }: { query: string }) {
  const { node, firstSelected } = useListboxContext();
  const { open, contentMounted } = usePopoverContext();
  const shown = open && contentMounted;

  useEffect(() => {
    if (shown) node.reset();
  }, [node, shown]);

  useRevealSelection(node, shown, query, firstSelected, (selected) =>
    node.highlight(selected, true),
  );

  return null;
}

type SelectRootImplProps<T, V extends SelectionValue> = SelectRootProps<T, V, SelectionMode> & {
  appliedValue?: readonly V[];
  wideContent?: boolean;
};

export function SelectRootImpl<T, V extends SelectionValue>(props: SelectRootImplProps<T, V>) {
  return (
    <Popover.Root
      mobileLayout={props.mobileLayout}
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      placement={props.placement}
    >
      <SelectRootBody {...props} />
    </Popover.Root>
  );
}

function SelectRootBody<T, V extends SelectionValue>(props: SelectRootImplProps<T, V>) {
  const [styleProps, selectProps] = splitCssProps(props);
  const {
    managed,
    rootProps: listboxRootProps,
    rest,
  } = useManagedListbox<T, V, typeof selectProps>(selectProps);
  const [listOptions, rootProps] = splitManagedListOptions<T, V, typeof rest>(rest);
  const {
    actionsVisibility,
    appliedValue,
    children,
    contentWidth,
    matchTriggerWidth = true,
    placeholder = "Select item",
    renderValue,
    wideContent = false,
  } = rootProps;
  const { controller, selectionMode } = managed;
  const popover = usePopoverContext();
  const sameWidth = matchTriggerWidth && contentWidth == null;
  const close = (event?: Event) => {
    popover.requestOpenChange(false, "item-press", event);
  };

  const wasOpen = useRef(popover.open);
  useLayoutEffect(() => {
    if (wasOpen.current && !popover.open) controller.search.reset();
    wasOpen.current = popover.open;
  });

  const { renderItemActions } = props;
  const list: ManagedListOptions<T, V> = {
    ...listOptions,
    renderItemActions:
      renderItemActions &&
      ((item, state) => renderItemActions(item, state, { close: () => close() })),
  };
  const appliedValues = appliedValue ?? controller.selectedValues;
  const appliedItems = controller.getItemsByValue(appliedValues);

  const contextValue: SelectContextValue = {
    managed: managed as ManagedListbox<unknown, SelectionValue>,
    list: list as SelectContextValue["list"],
    contentWidth,
    sameWidth,
    wideContent,
    appliedItems,
    triggerValue: renderValue
      ? renderValue({ value: appliedValue ?? props.value, selectedItems: appliedItems })
      : getSelectionLabel(appliedValues.length, appliedItems, props.getItemLabel, placeholder),
    hasValue: appliedValues.length > 0,
    close,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <ListboxRootImpl
        {...styleProps}
        actionsVisibility={actionsVisibility}
        indicatorPosition={list.indicatorPosition}
        {...listboxRootProps}
        onPick={(_, event) => {
          if (selectionMode === "single") close(event);
        }}
      >
        <SelectHighlightSync query={controller.search.query} />
        {children}
      </ListboxRootImpl>
    </SelectContext.Provider>
  );
}
