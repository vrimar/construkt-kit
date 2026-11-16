import { type ListCollection, createListCollection } from "@ark-ui/react/collection";
import { useCallback, useMemo } from "react";

import type { DistributiveOmit } from "#styled-system/types";

import { useLatestRef } from "../../hooks/useLatestRef";
import type {
  ManagedListOptions,
  ManagedSelectionProps,
  SelectionItemState,
  SelectionMode,
  SelectionProps,
  SelectionValue,
} from "./types";
import { type SelectionSearch, matchesQuery, useSelectionSearch } from "./useSelectionSearch";

export type SelectionValueChangeDetails = { value: string[] };

export const encodeSelectionValue = (value: SelectionValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

export interface SelectAllState<V> {
  allSelected: boolean;
  someSelected: boolean;
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

  return {
    allSelected,
    someSelected,
    toggle: () => {
      if (!allSelected) {
        return [...value, ...selectableValues.filter((entry) => !selectedSet.has(entry))];
      }
      const selectableSet = new Set(selectableValues);
      return value.filter((entry) => !selectableSet.has(entry));
    },
  };
}

export function splitKeys<P extends object, K extends string>(
  props: P,
  keys: Record<K, true>,
): [Partial<Record<K, unknown>>, DistributiveOmit<P, K>] {
  const picked: Partial<Record<K, unknown>> = {};
  const rest = { ...props } as Record<string, unknown>;
  for (const key of Object.keys(keys) as K[]) {
    picked[key] = rest[key];
    delete rest[key];
  }
  return [picked, rest as DistributiveOmit<P, K>];
}

const MANAGED_LIST_OPTIONS = {
  loading: true,
  emptyMessage: true,
  indicatorPosition: true,
  renderItem: true,
  renderItemActions: true,
  renderItemHint: true,
  renderGroupLabel: true,
  getItemProps: true,
  listMaxHeight: true,
  virtual: true,
} as const satisfies Record<keyof ManagedListOptions<unknown, SelectionValue>, true>;

type ManagedListOptionKey = keyof typeof MANAGED_LIST_OPTIONS;

export function splitManagedListOptions<
  T,
  V extends SelectionValue,
  P extends Partial<Record<ManagedListOptionKey, unknown>>,
>(props: P): [ManagedListOptions<T, V>, DistributiveOmit<P, ManagedListOptionKey>] {
  const [options, rest] = splitKeys(props, MANAGED_LIST_OPTIONS);
  return [options as ManagedListOptions<T, V>, rest];
}

export type SelectionControllerOptions<T, V extends SelectionValue> = ManagedSelectionProps<T, V> &
  SelectionProps<V, SelectionMode>;

export interface SelectionController<T, V extends SelectionValue> {
  collection: ListCollection<T>;
  groups: [string, T[]][];
  grouped: boolean;
  selectedValues: V[];
  getItemsByValue: (values: readonly SelectionValue[]) => T[];
  setValue(this: void, values: readonly V[]): void;
  getItemState: (item: T) => SelectionItemState<V>;
  getSelectAllState: () => SelectAllState<V>;
  search: SelectionSearch;
  listboxValue: string[];
  onListboxValueChange: (details: SelectionValueChangeDetails) => void;
}

export function useSelectionController<T, V extends SelectionValue>(
  options: SelectionControllerOptions<T, V>,
): SelectionController<T, V> {
  const { items, getItemValue, getItemLabel, isItemDisabled, groupBy, groupSort, value } = options;
  const optionsRef = useLatestRef(options);
  const search = useSelectionSearch(options.search);
  const filter = typeof options.search === "object" ? options.search.filter : undefined;

  const selectedValues = useMemo<V[]>(
    () => (value == null ? [] : Array.isArray(value) ? [...(value as readonly V[])] : [value as V]),
    [value],
  );

  const encodedMaps = useMemo(() => {
    const values = new Map<string, V>();
    const itemByValue = new Map<string, T>();

    for (const item of items) {
      const nativeValue = getItemValue(item);
      const encoded = encodeSelectionValue(nativeValue);
      if (itemByValue.has(encoded)) {
        throw new Error(
          `Selection items must have unique values. Duplicate value: ${String(nativeValue)}`,
        );
      }
      values.set(encoded, nativeValue);
      itemByValue.set(encoded, item);
    }

    for (const nativeValue of selectedValues) {
      values.set(encodeSelectionValue(nativeValue), nativeValue);
    }

    return { values, itemByValue };
  }, [getItemValue, items, selectedValues]);

  const { filterQuery } = search;
  const collection = useMemo(() => {
    const created = createListCollection<T>({
      items: items as T[],
      itemToString: getItemLabel,
      itemToValue: (item) => encodeSelectionValue(getItemValue(item)),
      isItemDisabled,
      groupBy,
      groupSort,
    });
    if (!filterQuery) return created;

    return created.filter((itemText, _index, item) =>
      filter ? filter(item, filterQuery) : matchesQuery(itemText, filterQuery),
    );
  }, [filter, filterQuery, getItemLabel, getItemValue, groupBy, groupSort, isItemDisabled, items]);

  const groups = useMemo(() => collection.group(), [collection]);
  const grouped = !(groups.length === 1 && groups[0][0] === "");

  const getItemsByValue = useCallback(
    (values: readonly SelectionValue[]) =>
      values
        .map((nativeValue) => encodedMaps.itemByValue.get(encodeSelectionValue(nativeValue)))
        .filter((item): item is T => item !== undefined),
    [encodedMaps.itemByValue],
  );
  const selectedSet = useMemo(() => new Set<SelectionValue>(selectedValues), [selectedValues]);

  const setValue = useCallback(
    (next: readonly V[]) => {
      const latest = optionsRef.current;
      if (latest.selectionMode === "multiple") latest.onValueChange([...next]);
      else if (next.length > 0) latest.onValueChange(next[0]);
    },
    [optionsRef],
  );

  const listboxValue = useMemo(() => selectedValues.map(encodeSelectionValue), [selectedValues]);
  const onListboxValueChange = useCallback(
    ({ value: encoded }: SelectionValueChangeDetails) =>
      setValue(
        encoded
          .map((entry) => encodedMaps.values.get(entry))
          .filter((entry): entry is V => entry !== undefined),
      ),
    [encodedMaps.values, setValue],
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
        collection.items.filter((item) => !collection.getItemDisabled(item)).map(getItemValue),
      ),
    [collection, getItemValue, selectedValues],
  );

  return {
    collection,
    groups,
    grouped,
    selectedValues,
    getItemsByValue,
    setValue,
    getItemState,
    getSelectAllState: getShownSelectAllState,
    search,
    listboxValue,
    onListboxValueChange,
  };
}
