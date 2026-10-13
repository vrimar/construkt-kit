import { type ListCollection, createListCollection } from "@ark-ui/react/collection";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type {
  ManagedListOptions,
  ManagedSelectionProps,
  SelectionItemState,
  SelectionSearchOptions,
  SelectionValue,
} from "./types";

export type SelectionValueChangeDetails = { value: string[] };

export const normalizeQuery = (query: string) => query.trim().toLowerCase();

export const matchesQuery = (text: string, normalizedQuery: string) =>
  text.toLowerCase().includes(normalizedQuery);

export const encodeSelectionValue = (value: SelectionValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

export function getSelectionLabel<T>(
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

export interface SelectAllState {
  allSelected: boolean;
  someSelected: boolean;
  toggle: () => string[];
}

export function getSelectAllState(
  value: readonly string[],
  selectableValues: readonly string[],
): SelectAllState {
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

const MANAGED_LIST_OPTIONS = {
  loading: true,
  emptyMessage: true,
  indicatorPosition: true,
  renderItem: true,
  renderItemActions: true,
  renderGroupLabel: true,
  getItemProps: true,
  listMaxHeight: true,
  virtual: true,
} as const satisfies Record<keyof ManagedListOptions<unknown, SelectionValue>, true>;

type ManagedListOptionKey = keyof typeof MANAGED_LIST_OPTIONS;

const MANAGED_LIST_OPTION_KEYS = Object.keys(MANAGED_LIST_OPTIONS) as ManagedListOptionKey[];

export function splitManagedListOptions<
  T,
  V extends SelectionValue,
  P extends Partial<Record<ManagedListOptionKey, unknown>>,
>(props: P): [ManagedListOptions<T, V>, Omit<P, ManagedListOptionKey>] {
  const options: Record<string, unknown> = {};
  const rest: Partial<P> = { ...props };
  for (const key of MANAGED_LIST_OPTION_KEYS) {
    options[key] = props[key];
    delete rest[key];
  }
  return [options, rest as Omit<P, ManagedListOptionKey>];
}

export interface SelectionControllerOptions<
  T,
  V extends SelectionValue,
> extends ManagedSelectionProps<T, V> {
  selectionMode: "single" | "multiple";
  value: V | readonly V[] | null;
  onValueChange: (value: V | V[]) => unknown;
}

export interface SelectionSearchState {
  showInput: boolean;
  query: string;
  placeholder: string;
  autoFocus: boolean;
  endElement?: ReactNode;
  setQuery: (query: string) => void;
  reset: () => void;
}

export interface SelectionController<T, V extends SelectionValue> {
  collection: ListCollection<T>;
  groups: [string, T[]][];
  grouped: boolean;
  encodedValue: string[];
  selectedValues: V[];
  selectedItems: T[];
  getItemsByValue: (values: readonly SelectionValue[]) => T[];
  handleValueChange: (details: SelectionValueChangeDetails) => void;
  getItemState: (item: T) => SelectionItemState<V>;
  getSelectAllState: () => SelectAllState;
  search: SelectionSearchState;
}

export function useSelectionController<T, V extends SelectionValue>({
  items,
  getItemValue,
  getItemLabel,
  isItemDisabled,
  groupBy,
  groupSort,
  selectionMode,
  value,
  onValueChange,
  search,
}: SelectionControllerOptions<T, V>): SelectionController<T, V> {
  const searchOptions: SelectionSearchOptions<T> | undefined =
    typeof search === "object" ? search : search === true ? {} : undefined;
  const searchOptionsRef = useLatestRef(searchOptions);

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

  const defaultQuery = searchOptions?.defaultQuery ?? "";
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const query = searchOptions?.query ?? internalQuery;
  const normalizedQuery = normalizeQuery(query);

  const filter = searchOptions?.filter;
  const filterQuery = searchOptions?.mode === "external" ? "" : normalizedQuery;
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

  const encodedValue = useMemo(() => selectedValues.map(encodeSelectionValue), [selectedValues]);
  const getItemsByValue = useCallback(
    (values: readonly SelectionValue[]) =>
      values
        .map((nativeValue) => encodedMaps.itemByValue.get(encodeSelectionValue(nativeValue)))
        .filter((item): item is T => item !== undefined),
    [encodedMaps.itemByValue],
  );
  const selectedItems = useMemo(
    () => getItemsByValue(selectedValues),
    [getItemsByValue, selectedValues],
  );
  const selectedSet = useMemo(() => new Set(encodedValue), [encodedValue]);

  const handleValueChange = useCallback(
    ({ value: nextEncoded }: SelectionValueChangeDetails) => {
      const next = nextEncoded
        .map((encoded) => encodedMaps.values.get(encoded))
        .filter((entry): entry is V => entry !== undefined);

      if (selectionMode === "multiple") onValueChange(next);
      else if (next.length > 0) onValueChange(next[0]);
    },
    [encodedMaps.values, onValueChange, selectionMode],
  );

  const getItemState = useCallback(
    (item: T): SelectionItemState<V> => {
      const nativeValue = getItemValue(item);
      return {
        value: nativeValue,
        selected: selectedSet.has(encodeSelectionValue(nativeValue)),
        disabled: isItemDisabled?.(item) ?? false,
      };
    },
    [getItemValue, isItemDisabled, selectedSet],
  );

  const getShownSelectAllState = useCallback(
    () =>
      getSelectAllState(
        encodedValue,
        collection.getValues(collection.items.filter((item) => !collection.getItemDisabled(item))),
      ),
    [collection, encodedValue],
  );

  const setQuery = useCallback(
    (nextQuery: string) => {
      if (searchOptionsRef.current?.query == null) setInternalQuery(nextQuery);
      searchOptionsRef.current?.onQueryChange?.(nextQuery);
    },
    [searchOptionsRef],
  );

  const reset = useCallback(() => {
    if (searchOptionsRef.current?.query != null) return;
    setInternalQuery(defaultQuery);
    searchOptionsRef.current?.onQueryChange?.(defaultQuery);
  }, [defaultQuery, searchOptionsRef]);

  return {
    collection,
    groups,
    grouped,
    encodedValue,
    selectedValues,
    selectedItems,
    getItemsByValue,
    handleValueChange,
    getItemState,
    getSelectAllState: getShownSelectAllState,
    search: {
      showInput: searchOptions != null && searchOptions.showInput !== false,
      query,
      placeholder: searchOptions?.placeholder ?? "Search...",
      autoFocus: searchOptions?.autoFocus ?? false,
      endElement: searchOptions?.endElement,
      setQuery,
      reset,
    },
  };
}
