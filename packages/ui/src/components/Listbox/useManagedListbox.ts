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
      items: controller.items,
      getItemValue: options.getItemValue,
      getItemLabel: options.getItemLabel,
      isItemDisabled: options.isItemDisabled,
      selectionMode,
      value: options.value,
      onValueChange: options.onValueChange,
      scrollToIndex: virtual ? (index: number) => scrollToIndexRef.current?.(index) : undefined,
    } as SelectionControllerOptions<T, V> & {
      items: readonly T[];
      scrollToIndex: ((index: number) => void) | undefined;
    },
  };
}
