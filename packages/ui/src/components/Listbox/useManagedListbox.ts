import { type RefObject, useRef } from "react";

import type { DistributiveOmit } from "#styled-system/types";

import { splitKeys } from "../../foundations/props";
import type { ScrollToIndexRef } from "../ScrollArea";
import {
  type SelectionController,
  type SelectionControllerOptions,
  type SelectionMode,
  type SelectionValue,
  useSelectionController,
} from "../selection";
import type { ManagedListOptions } from "./types";

export interface ManagedListbox<T, V extends SelectionValue> {
  controller: SelectionController<T, V>;
  selectionMode: SelectionMode;
  virtual: boolean;
  scrollToIndexRef: ScrollToIndexRef;
  inputRef: RefObject<HTMLInputElement | null>;
}

type ManagedSelectionOptions<T, V extends SelectionValue> = SelectionControllerOptions<T, V> & {
  virtual?: boolean;
};

type ListOptions<T, V extends SelectionValue> = Omit<ManagedListOptions<T, V>, "virtual">;

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
} as const satisfies Record<keyof ManagedSelectionOptions<unknown, SelectionValue>, true>;

const MANAGED_LIST_OPTIONS = {
  loading: true,
  emptyMessage: true,
  emptyState: true,
  indicatorPosition: true,
  renderItem: true,
  renderItemActions: true,
  renderItemHint: true,
  renderGroupLabel: true,
  getItemProps: true,
  listMaxHeight: true,
} as const satisfies Record<keyof ListOptions<unknown, SelectionValue>, true>;

type ManagedKey = keyof typeof MANAGED_LISTBOX_KEYS | keyof typeof MANAGED_LIST_OPTIONS;

/**
 * The selection controller, list options and listbox root props of a managed list, split from
 * `props`; `rest` holds the props the managed list doesn't read.
 */
export function useManagedListbox<
  T,
  V extends SelectionValue,
  P extends ManagedSelectionOptions<T, V> & Partial<Record<keyof ListOptions<T, V>, unknown>>,
>(props: P) {
  const [picked, others] = splitKeys(props, MANAGED_LISTBOX_KEYS);
  const [listPicked, rest] = splitKeys(others, MANAGED_LIST_OPTIONS);
  const options = picked as ManagedSelectionOptions<T, V>;
  const listOptions = listPicked as ListOptions<T, V>;
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
    listOptions,
    rest: rest as DistributiveOmit<P, ManagedKey>,
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
