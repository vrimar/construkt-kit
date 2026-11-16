import type { ListboxScrollToIndexDetails } from "@ark-ui/react/listbox";
import { type RefObject, useRef } from "react";

import type { ScrollToIndexRef } from "../ScrollArea/VirtualRows";
import type { SelectionMode, SelectionValue } from "./types";
import {
  type SelectionController,
  type SelectionControllerOptions,
  splitKeys,
  useSelectionController,
} from "./useSelectionController";

export interface ManagedListbox<T, V extends SelectionValue> {
  controller: SelectionController<T, V>;
  selectionMode: SelectionMode;
  virtual: boolean;
  scrollToIndexRef: ScrollToIndexRef;
  inputRef: RefObject<HTMLInputElement | null>;
}

type ManagedListboxProps<T, V extends SelectionValue> = SelectionControllerOptions<T, V> & {
  virtual?: boolean;
  scrollToIndexFn?: (details: ListboxScrollToIndexDetails) => void;
};

const MANAGED_LISTBOX_KEYS = {
  items: true,
  getItemValue: true,
  getItemLabel: true,
  isItemDisabled: true,
  groupBy: true,
  groupSort: true,
  search: true,
  selectionMode: true,
  value: true,
  onValueChange: true,
  virtual: true,
  scrollToIndexFn: true,
} as const satisfies Record<keyof ManagedListboxProps<unknown, SelectionValue>, true>;

export function useManagedListbox<T, V extends SelectionValue, P extends ManagedListboxProps<T, V>>(
  props: P,
) {
  const [picked, rest] = splitKeys(props, MANAGED_LISTBOX_KEYS);
  const options = picked as ManagedListboxProps<T, V>;
  const controller = useSelectionController<T, V>(options);
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const virtual = options.virtual === true && !controller.grouped;
  const selectionMode = options.selectionMode ?? "single";
  const managed: ManagedListbox<T, V> = {
    controller,
    selectionMode,
    virtual,
    scrollToIndexRef,
    inputRef,
  };

  return {
    managed,
    rest,
    rootProps: {
      collection: controller.collection,
      value: controller.listboxValue,
      onValueChange: controller.onListboxValueChange,
      selectionMode,
      deselectable: selectionMode === "single" ? false : undefined,
      disallowSelectAll: true,
      typeahead: false,
      scrollToIndexFn: virtual
        ? (details: ListboxScrollToIndexDetails) => scrollToIndexRef.current?.(details.index)
        : options.scrollToIndexFn,
    },
  };
}
