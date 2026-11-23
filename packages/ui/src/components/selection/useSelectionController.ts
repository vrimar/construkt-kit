import { useCallback, useMemo } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import {
  emitSelection,
  encodeSelectionValue,
  indexSelectionItems,
  toSelectionArray,
} from "./selectionValue";
import type {
  ManagedSelectionProps,
  SelectionGroupSort,
  SelectionItemState,
  SelectionMode,
  SelectionProps,
  SelectionValue,
} from "./types";
import { type SelectionSearch, matchesQuery, useSelectionSearch } from "./useSelectionSearch";

export interface SelectAllState<V> {
  allSelected: boolean;
  someSelected: boolean;
  select: () => V[];
  clear: () => V[];
  toggle: () => V[];
}

export function getSelectAllState<V>(
  value: readonly V[],
  selectableValues: readonly V[],
): SelectAllState<V> {
  const selectedSet = new Set(value);
  const allSelected =
    selectableValues.length > 0 && selectableValues.every((entry) => selectedSet.has(entry));
  const someSelected = !allSelected && selectableValues.some((entry) => selectedSet.has(entry));
  const select = () => [...value, ...selectableValues.filter((entry) => !selectedSet.has(entry))];
  const clear = () => {
    const selectableSet = new Set(selectableValues);
    return value.filter((entry) => !selectableSet.has(entry));
  };

  return {
    allSelected,
    someSelected,
    select,
    clear,
    toggle: () => (allSelected ? clear() : select()),
  };
}

function compareGroups(sort: SelectionGroupSort, a: string, b: string): number {
  if (typeof sort === "function") return sort(a, b);
  if (Array.isArray(sort)) {
    const indexA = sort.indexOf(a);
    const indexB = sort.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }
  if (sort === "asc") return a.localeCompare(b);
  if (sort === "desc") return b.localeCompare(a);
  return 0;
}

function toGroups<T>(
  items: readonly T[],
  groupBy: ((item: T, index: number) => string) | undefined,
  groupSort: SelectionGroupSort | undefined,
): [string, T[]][] {
  if (!groupBy) return [["", [...items]]];
  const groups = new Map<string, T[]>();
  items.forEach((item, index) => {
    const key = groupBy(item, index);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  });
  const entries = [...groups.entries()];
  if (groupSort) entries.sort(([a], [b]) => compareGroups(groupSort, a, b));
  return entries;
}

export type SelectionControllerOptions<T, V extends SelectionValue> = ManagedSelectionProps<T, V> &
  SelectionProps<V, SelectionMode>;

export interface SelectionController<T, V extends SelectionValue> {
  /** The items the search shows, in the order the list shows them. */
  items: readonly T[];
  groups: [string, T[]][];
  grouped: boolean;
  selectedValues: V[];
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  getItemsByValue: (values: readonly SelectionValue[]) => T[];
  setValue(this: void, values: readonly V[]): void;
  getItemState: (item: T) => SelectionItemState<V>;
  getSelectAllState: () => SelectAllState<V>;
  search: SelectionSearch;
}

export function useSelectionController<T, V extends SelectionValue>(
  options: SelectionControllerOptions<T, V>,
): SelectionController<T, V> {
  const { items, getItemValue, getItemLabel, isItemDisabled, groupBy, groupSort, value } = options;
  const optionsRef = useLatestRef(options);
  const search = useSelectionSearch(options.search);
  const filter = typeof options.search === "object" ? options.search.filter : undefined;

  const selectedValues = useMemo(() => toSelectionArray<V>(value), [value]);

  const itemByValue = useMemo(
    () => indexSelectionItems(items, getItemValue).items,
    [getItemValue, items],
  );

  const { filterQuery } = search;
  const groups = useMemo(() => {
    const shown = filterQuery
      ? items.filter((item) =>
          filter ? filter(item, filterQuery) : matchesQuery(getItemLabel(item), filterQuery),
        )
      : items;
    return toGroups(shown, groupBy, groupSort);
  }, [filter, filterQuery, getItemLabel, groupBy, groupSort, items]);

  const grouped = !(groups.length === 1 && groups[0][0] === "");
  const shownItems = useMemo(() => groups.flatMap(([, groupItems]) => groupItems), [groups]);

  const getItemsByValue = useCallback(
    (values: readonly SelectionValue[]) =>
      values
        .map((nativeValue) => itemByValue.get(encodeSelectionValue(nativeValue)))
        .filter((item): item is T => item !== undefined),
    [itemByValue],
  );
  const selectedSet = useMemo(() => new Set<SelectionValue>(selectedValues), [selectedValues]);

  const setValue = useCallback(
    (next: readonly V[]) => {
      const latest = optionsRef.current;
      emitSelection(latest.selectionMode, latest.onValueChange, next);
    },
    [optionsRef],
  );

  const getItemState = useCallback(
    (item: T): SelectionItemState<V> => {
      const nativeValue = getItemValue(item);
      return {
        value: nativeValue,
        selected: selectedSet.has(nativeValue),
        disabled: isItemDisabled?.(item) ?? false,
      };
    },
    [getItemValue, isItemDisabled, selectedSet],
  );

  const getShownSelectAllState = useCallback(
    () =>
      getSelectAllState(
        selectedValues,
        shownItems.filter((item) => !(isItemDisabled?.(item) ?? false)).map(getItemValue),
      ),
    [getItemValue, isItemDisabled, selectedValues, shownItems],
  );

  return {
    items: shownItems,
    groups,
    grouped,
    selectedValues,
    getItemValue,
    getItemLabel,
    getItemsByValue,
    setValue,
    getItemState,
    getSelectAllState: getShownSelectAllState,
    search,
  };
}
