import { useEnvironmentContext } from "@ark-ui/react/environment";
import { useListboxContext } from "@ark-ui/react/listbox";
import { usePresenceContext } from "@ark-ui/react/presence";
import { type JSX, type RefObject, useContext, useEffect, useRef, useState } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { useLatestRef } from "../../hooks/useLatestRef";
import { isComposingEvent } from "../imeComposition";
import { Listbox } from "../Listbox/Listbox";
import {
  type ManagedListbox,
  type ScrollToIndexRef,
  getSelectionLabel,
  splitManagedListOptions,
  useManagedListbox,
} from "../Listbox/managed";
import type {
  ManagedListOptions,
  MultipleSelectionProps,
  SelectionMode,
  SelectionValue,
  SingleSelectionProps,
} from "../Listbox/types";
import { Popover } from "../Popover";
import {
  SelectContext,
  type SelectContextValue,
  type SelectRootOverrides,
  SelectRootOverridesContext,
} from "./Select.context";
import { SelectContent, SelectSimpleBody, SelectTrigger, selectListParts } from "./Select.parts";
import type { SelectProps, SelectRootProps, SelectSimpleProps } from "./Select.types";

const ITEM_SELECTOR = '[data-scope="listbox"][data-part="item"]';
const LIST_SELECTOR = '[role="listbox"]';
const CONTENT_SELECTOR = '[data-scope="popover"][data-part="content"]';

function findItem(target: EventTarget, highlighted: boolean) {
  if (!(target instanceof Element)) return null;
  return highlighted
    ? target.closest(CONTENT_SELECTOR)?.querySelector(`${ITEM_SELECTOR}[data-highlighted]`)
    : target.closest(ITEM_SELECTOR);
}

const isInList = (target: EventTarget) =>
  target instanceof Element && target.closest(LIST_SELECTOR) != null;

interface SelectHighlightSyncProps {
  open: boolean;
  pointerRef: RefObject<boolean>;
  scrollToIndexRef: ScrollToIndexRef;
  virtual: boolean;
}

// The listbox machine outlives the lazily mounted content, so it never resets per open.
function SelectHighlightSync({
  open,
  pointerRef,
  scrollToIndexRef,
  virtual,
}: SelectHighlightSyncProps) {
  const listbox = useListboxContext();
  const environment = useEnvironmentContext();
  const { present } = usePresenceContext();
  const listboxRef = useLatestRef(listbox);
  const { highlightedValue } = listbox;
  const shown = open && present;

  useEffect(() => {
    if (!shown) return;
    const { clearHighlightedValue, collection, value } = listboxRef.current;
    clearHighlightedValue();
    const [selected] = collection.sort(value.filter((item) => collection.has(item)));
    if (selected == null) return;
    // A frame lets the popover place itself before the highlight scrolls the selection into view.
    const frame = requestAnimationFrame(() => {
      pointerRef.current = false;
      listboxRef.current.highlightValue(selected);
    });
    return () => cancelAnimationFrame(frame);
  }, [listboxRef, pointerRef, shown]);

  useEffect(() => {
    if (highlightedValue == null || pointerRef.current) return;
    const { collection, getContentProps } = listboxRef.current;
    if (virtual) {
      scrollToIndexRef.current?.(collection.indexOf(highlightedValue));
      return;
    }
    const root = environment.getRootNode() as Document | ShadowRoot;
    const { id, "aria-activedescendant": itemId } = getContentProps();
    const content = id == null ? null : root.getElementById(id);
    if (content == null || itemId == null || content.scrollHeight <= content.clientHeight) return;
    root.getElementById(itemId)?.scrollIntoView({ block: "nearest" });
  }, [environment, highlightedValue, listboxRef, pointerRef, scrollToIndexRef, virtual]);

  return null;
}

export type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemActionHelpers,
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

function SelectRoot<T, V extends SelectionValue>(props: SelectRootProps<T, V, SelectionMode>) {
  const [styleProps, selectProps] = splitCssProps(props);
  const [listOptions, rootProps] = splitManagedListOptions<T, V, typeof selectProps>(selectProps);
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
    matchTriggerWidth = true,
    mobileLayout,
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
  const { renderItemActions } = props;
  const overrides = useContext(SelectRootOverridesContext) as SelectRootOverrides<V> | null;
  const list: ManagedListOptions<T, V> = {
    ...listOptions,
    renderItemActions:
      renderItemActions &&
      ((item, state) => renderItemActions(item, state, { close: () => handleOpenChange(false) })),
  };
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  const pointerRef = useRef(false);
  const sameWidth = matchTriggerWidth && contentWidth == null;

  function handleOpenChange(nextOpen: boolean) {
    if (open == null) setInternalOpen(nextOpen);
    if (!nextOpen) managed.controller.search.reset();
    onOpenChange?.(nextOpen);
  }

  // Re-picking the current value changes nothing, so onValueChange never fires to close.
  function closeOnReselect(item: Element | null | undefined) {
    if (selectionMode === "single" && item?.matches('[data-state="checked"]:not([data-disabled])'))
      handleOpenChange(false);
  }

  const { managed, rootProps: listboxRootProps } = useManagedListbox<T, V>({
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    groupBy,
    groupSort,
    selectionMode,
    value,
    onValueChange: (nextValue) => {
      (onValueChange as (value: V | V[]) => unknown)(nextValue);
      if (selectionMode === "single") handleOpenChange(false);
    },
    search,
    virtual: list.virtual,
  });
  const { controller } = managed;
  const appliedValues = overrides?.appliedValue ?? controller.selectedValues;
  const appliedItems = controller.getItemsByValue(appliedValues);

  const contextValue: SelectContextValue = {
    managed: managed as ManagedListbox<unknown, SelectionValue>,
    list: list as SelectContextValue["list"],
    contentWidth,
    sameWidth,
    wideContent: overrides?.wideContent ?? false,
    triggerValue: renderValue
      ? renderValue({ value: overrides?.appliedValue ?? value, selectedItems: appliedItems })
      : getSelectionLabel(appliedValues.length, appliedItems, getItemLabel, placeholder),
    hasValue: appliedValues.length > 0,
    close: () => handleOpenChange(false),
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <Popover.Root
        mobileLayout={mobileLayout}
        open={resolvedOpen}
        onOpenChange={({ open: nextOpen }) => handleOpenChange(nextOpen)}
        positioning={{ placement, sameWidth }}
      >
        <Listbox.Root
          {...styleProps}
          actionsVisibility={actionsVisibility}
          indicatorPosition={list.indicatorPosition}
          {...listboxRootProps}
          onClick={(event) => closeOnReselect(findItem(event.target, false))}
          onKeyDown={(event) => {
            if (isComposingEvent(event)) return;
            if (event.key === "Enter" || (event.key === " " && isInList(event.target)))
              closeOnReselect(findItem(event.target, true));
          }}
          onKeyDownCapture={() => {
            pointerRef.current = false;
          }}
          onPointerDownCapture={() => {
            pointerRef.current = true;
          }}
        >
          <SelectHighlightSync
            open={resolvedOpen}
            pointerRef={pointerRef}
            scrollToIndexRef={managed.scrollToIndexRef}
            virtual={managed.virtual}
          />
          <SelectRootOverridesContext.Provider value={null}>
            {children}
          </SelectRootOverridesContext.Provider>
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
  contentCss,
  listCss,
  footer,
  ...rootProps
}: SelectProps<T, V, SelectionMode>) {
  return (
    <SelectRoot {...rootProps}>
      <SelectSimpleBody
        triggerProps={triggerProps}
        contentCss={contentCss}
        listCss={listCss}
        footer={footer}
      />
    </SelectRoot>
  );
}

interface SelectRootComponent {
  <T, V extends SelectionValue>(props: SelectRootProps<T, V>): JSX.Element;
  <T, V extends SelectionValue>(props: SelectRootProps<T, V, "multiple">): JSX.Element;
}

const Root: SelectRootComponent = SelectRoot;

export const Select = Object.assign(SelectSimple, {
  Root,
  Trigger: SelectTrigger,
  Content: SelectContent,
  ...selectListParts,
});
