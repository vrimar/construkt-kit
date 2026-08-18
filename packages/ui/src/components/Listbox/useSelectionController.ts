import { type ListCollection, useListCollection } from "@ark-ui/react/collection";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SelectionItemState, SelectionSearchOptions, SelectionValue } from "./types";

export type SelectionValueChangeDetails = { value: string[] };

const defaultSearchMatch = (itemText: string, query: string) =>
  itemText.toLowerCase().includes(query.toLowerCase());

export const encodeSelectionValue = (value: SelectionValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

interface UseSelectionControllerParams<T, V extends SelectionValue> {
  items: readonly T[];
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
  selectionMode: "single" | "multiple";
  value: V | readonly V[] | null;
  onValueChange: (value: V | V[] | null) => unknown;
  search?: boolean | SelectionSearchOptions<T>;
  searchDefaultEnabled?: boolean;
  searchDefaultAutoFocus?: boolean;
}

export interface SelectionController<T, V extends SelectionValue> {
  collection: ListCollection<T>;
  encodedValue: string[];
  selectedValues: V[];
  selectedItems: T[];
  selectionMode: "single" | "multiple";
  handleValueChange: (details: SelectionValueChangeDetails) => void;
  getItemState: (item: T) => SelectionItemState<V>;
  search: {
    enabled: boolean;
    showInput: boolean;
    query: string;
    placeholder: string;
    autoFocus: boolean;
    endElement?: ReactNode;
    setQuery: (query: string) => void;
    reset: () => void;
  };
}

export function useSelectionController<T, V extends SelectionValue>({
  items,
  getItemValue,
  getItemLabel,
  isItemDisabled,
  selectionMode,
  value,
  onValueChange,
  search,
  searchDefaultEnabled = false,
  searchDefaultAutoFocus = false,
}: UseSelectionControllerParams<T, V>): SelectionController<T, V> {
  const searchOptions: SelectionSearchOptions<T> | undefined =
    search === false
      ? undefined
      : typeof search === "object"
        ? search
        : search === true || searchDefaultEnabled
          ? {}
          : undefined;
  // Read only from event handlers and Ark's filter callback, so syncing after commit is
  // soon enough and keeps the callbacks below stable across renders.
  const searchOptionsRef = useRef(searchOptions);
  const filterRef = useRef(searchOptions?.filter);

  useEffect(() => {
    searchOptionsRef.current = searchOptions;
    filterRef.current = searchOptions?.filter;
  });

  const filterPredicate = useCallback(
    (itemText: string, query: string, item: T) =>
      filterRef.current ? filterRef.current(item, query) : defaultSearchMatch(itemText, query),
    [],
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

    const selected = value == null ? [] : Array.isArray(value) ? value : [value];
    for (const nativeValue of selected as readonly V[]) {
      values.set(encodeSelectionValue(nativeValue), nativeValue);
    }

    return { values, itemByValue };
  }, [getItemValue, items, value]);

  const { collection, filter, set } = useListCollection<T>({
    initialItems: items,
    itemToString: getItemLabel,
    itemToValue: (item) => encodeSelectionValue(getItemValue(item)),
    isItemDisabled,
    filter: filterPredicate,
  });

  useEffect(() => {
    set(items as T[]);
  }, [items, set]);

  const selectedValues = useMemo<V[]>(
    () => (value == null ? [] : Array.isArray(value) ? [...(value as readonly V[])] : [value as V]),
    [value],
  );
  const encodedValue = useMemo(() => selectedValues.map(encodeSelectionValue), [selectedValues]);
  const selectedItems = useMemo(
    () =>
      encodedValue
        .map((encoded) => encodedMaps.itemByValue.get(encoded))
        .filter((item): item is T => item !== undefined),
    [encodedMaps.itemByValue, encodedValue],
  );
  const selectedSet = useMemo(() => new Set(encodedValue), [encodedValue]);

  const handleValueChange = useCallback(
    ({ value: nextEncoded }: SelectionValueChangeDetails) => {
      const next = nextEncoded
        .map((encoded) => encodedMaps.values.get(encoded))
        .filter((entry): entry is V => entry !== undefined);

      if (selectionMode === "multiple") onValueChange(next);
      else onValueChange(next[0] ?? null);
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

  const defaultQuery = searchOptions?.defaultQuery ?? "";
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const query = searchOptions?.query ?? internalQuery;

  useEffect(() => {
    filter(query);
  }, [filter, items, query]);

  const setQuery = useCallback((nextQuery: string) => {
    if (searchOptionsRef.current?.query == null) setInternalQuery(nextQuery);
    searchOptionsRef.current?.onQueryChange?.(nextQuery);
  }, []);

  const reset = useCallback(() => {
    if (searchOptionsRef.current?.query != null) return;
    setInternalQuery(defaultQuery);
    searchOptionsRef.current?.onQueryChange?.(defaultQuery);
  }, [defaultQuery]);

  return {
    collection,
    encodedValue,
    selectedValues,
    selectedItems,
    selectionMode,
    handleValueChange,
    getItemState,
    search: {
      enabled: searchOptions != null,
      showInput: searchOptions != null && searchOptions.showInput !== false,
      query,
      placeholder: searchOptions?.placeholder ?? "Search...",
      autoFocus: searchOptions?.autoFocus ?? searchDefaultAutoFocus,
      endElement: searchOptions?.endElement,
      setQuery,
      reset,
    },
  };
}
