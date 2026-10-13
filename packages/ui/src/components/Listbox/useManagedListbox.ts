import type { ListboxScrollToIndexDetails } from "@ark-ui/react/listbox";
import { type RefObject, useRef } from "react";

import type { SelectionValue } from "./types";
import {
  type SelectionController,
  type SelectionControllerOptions,
  useSelectionController,
} from "./useSelectionController";

export type ScrollToIndexRef = { current: ((index: number) => void) | undefined };

export interface ManagedListbox<T, V extends SelectionValue> {
  controller: SelectionController<T, V>;
  selectionMode: "single" | "multiple";
  virtual: boolean;
  scrollToIndexRef: ScrollToIndexRef;
  inputRef: RefObject<HTMLInputElement | null>;
}

interface UseManagedListboxOptions<T, V extends SelectionValue> extends SelectionControllerOptions<
  T,
  V
> {
  virtual?: boolean;
  scrollToIndexFn?: (details: ListboxScrollToIndexDetails) => void;
}

export function useManagedListbox<T, V extends SelectionValue>({
  virtual,
  scrollToIndexFn,
  ...options
}: UseManagedListboxOptions<T, V>) {
  const controller = useSelectionController<T, V>(options);
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const virtualized = virtual === true && !controller.grouped;
  const { selectionMode } = options;
  const managed: ManagedListbox<T, V> = {
    controller,
    selectionMode,
    virtual: virtualized,
    scrollToIndexRef,
    inputRef,
  };

  return {
    managed,
    rootProps: {
      collection: controller.collection,
      value: controller.encodedValue,
      onValueChange: controller.handleValueChange,
      selectionMode,
      deselectable: selectionMode === "single" ? false : undefined,
      disallowSelectAll: true,
      scrollToIndexFn: virtualized
        ? (details: ListboxScrollToIndexDetails) => scrollToIndexRef.current?.(details.index)
        : scrollToIndexFn,
    },
  };
}
