import { useMemo } from "react";

import type { ListEntry } from "../../primitives/listbox";
import { indexSelectionItems } from "./selectionValue";
import type { SelectionItemSource, SelectionValue } from "./types";

/** The options of `items` in list order, and each one's value by its encoding; throws on a repeated value. */
export function useListEntries<T, V extends SelectionValue>({
  items,
  getItemValue,
  getItemLabel,
  isItemDisabled,
}: SelectionItemSource<T, V>) {
  return useMemo(() => {
    const index = indexSelectionItems(items, getItemValue);
    const entries: ListEntry[] = Array.from(index.items, ([value, item]) => ({
      value,
      label: getItemLabel(item),
      disabled: isItemDisabled?.(item) ?? false,
    }));
    return { entries, values: index.values };
  }, [items, getItemValue, getItemLabel, isItemDisabled]);
}
