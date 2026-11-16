import { useEnvironmentContext } from "@ark-ui/react/environment";
import { useListboxContext } from "@ark-ui/react/listbox";
import { usePresenceContext } from "@ark-ui/react/presence";
import { type ReactNode, type RefObject, useEffect } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { isComposingEvent } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import {
  scrollIntoViewWithin,
  useHighlightIntoView,
  useHighlightSource,
} from "../../hooks/useHighlightIntoView";
import { useLatestRef } from "../../hooks/useLatestRef";
import { Listbox } from "../Listbox/Listbox";
import {
  type ManagedListbox,
  splitManagedListOptions,
  useManagedListbox,
} from "../Listbox/managed";
import type { ManagedListOptions, SelectionMode, SelectionValue } from "../Listbox/types";
import { Popover } from "../Popover";
import type { ScrollToIndexRef } from "../ScrollArea/VirtualRows";
import { SelectContext, type SelectContextValue } from "./Select.context";
import type { SelectRootProps } from "./Select.types";

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

  useHighlightIntoView(listbox.highlightedValue, pointerRef, (highlightedValue) => {
    const { collection, getContentProps } = listbox;
    if (virtual) {
      scrollToIndexRef.current?.(collection.indexOf(highlightedValue));
      return;
    }
    const root = environment.getRootNode() as Document | ShadowRoot;
    const { id, "aria-activedescendant": itemId } = getContentProps();
    scrollIntoViewWithin(
      id == null ? null : root.getElementById(id),
      itemId == null ? null : root.getElementById(itemId),
    );
  });

  return null;
}

type SelectRootImplProps<T, V extends SelectionValue> = SelectRootProps<T, V, SelectionMode> & {
  appliedValue?: readonly V[];
  wideContent?: boolean;
};

export function SelectRootImpl<T, V extends SelectionValue>(props: SelectRootImplProps<T, V>) {
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
    defaultOpen = false,
    matchTriggerWidth = true,
    mobileLayout,
    onOpenChange,
    open,
    placeholder = "Select item",
    placement,
    renderValue,
    wideContent = false,
  } = rootProps;
  const { controller, selectionMode } = managed;
  const [resolvedOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const { pointerRef, handlers: highlightSource } = useHighlightSource();
  const sameWidth = matchTriggerWidth && contentWidth == null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) controller.search.reset();
    setOpen(nextOpen);
  };
  const close = () => handleOpenChange(false);

  // Re-picking the current value changes nothing, so onValueChange never fires to close.
  const closeOnReselect = (item: Element | null | undefined) => {
    if (selectionMode === "single" && item?.matches('[data-state="checked"]:not([data-disabled])'))
      close();
  };

  const { renderItemActions } = props;
  const list: ManagedListOptions<T, V> = {
    ...listOptions,
    renderItemActions:
      renderItemActions && ((item, state) => renderItemActions(item, state, { close })),
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
          {...highlightSource}
          onValueChange={(details) => {
            listboxRootProps.onValueChange(details);
            if (selectionMode === "single" && details.value.length > 0) close();
          }}
          onClick={(event) => closeOnReselect(findItem(event.target, false))}
          onKeyDown={(event) => {
            if (isComposingEvent(event)) return;
            if (event.key === "Enter" || (event.key === " " && isInList(event.target)))
              closeOnReselect(findItem(event.target, true));
          }}
        >
          <SelectHighlightSync
            open={resolvedOpen}
            pointerRef={pointerRef}
            scrollToIndexRef={managed.scrollToIndexRef}
            virtual={managed.virtual}
          />
          {children}
        </Listbox.Root>
      </Popover.Root>
    </SelectContext.Provider>
  );
}
