import { type ListCollection, createListCollection } from "@ark-ui/react/collection";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  ManagedListOptions,
  SelectionGroupSort,
  SelectionItemState,
  SelectionSearchOptions,
  SelectionValue,
} from "./types";

export type SelectionValueChangeDetails = { value: string[] };

export const normalizeQuery = (query: string) => query.trim().toLowerCase();

export const matchesQuery = (text: string, query: string) =>
  text.toLowerCase().includes(normalizeQuery(query));

export const encodeSelectionValue = (value: SelectionValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

export function selectItemsByValue<T, V extends SelectionValue>(
  items: readonly T[],
  values: readonly V[],
  getItemValue: (item: T) => V,
): T[] {
  const itemByValue = new Map(
    items.map((item) => [encodeSelectionValue(getItemValue(item)), item]),
  );
  return values
    .map((value) => itemByValue.get(encodeSelectionValue(value)))
    .filter((item): item is T => item !== undefined);
}

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

const MANAGED_LIST_OPTION_KEYS = [
  "loading",
  "emptyMessage",
  "indicatorPosition",
  "renderItem",
  "renderItemActions",
  "renderGroupLabel",
  "getItemProps",
  "virtual",
] as const satisfies ReadonlyArray<keyof ManagedListOptions<unknown, SelectionValue>>;

type ManagedListOptionKey = (typeof MANAGED_LIST_OPTION_KEYS)[number];

export function splitManagedListOptions<
  T,
  V extends SelectionValue,
  P extends ManagedListOptions<T, V>,
>(props: P): [ManagedListOptions<T, V>, Omit<P, ManagedListOptionKey>] {
  const options: Record<string, unknown> = {};
  const rest: Partial<P> = { ...props };
  for (const key of MANAGED_LIST_OPTION_KEYS) {
    options[key] = props[key];
    delete rest[key];
  }
  return [options, rest as Omit<P, ManagedListOptionKey>];
}

interface UseSelectionControllerParams<T, V extends SelectionValue> {
  items: readonly T[];
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
  groupBy?: (item: T, index: number) => string;
  groupSort?: SelectionGroupSort;
  selectionMode: "single" | "multiple";
  value: V | readonly V[] | null;
  onValueChange: (value: V | V[] | null) => unknown;
  search?: boolean | SelectionSearchOptions<T>;
}

export interface SelectionController<T, V extends SelectionValue> {
  collection: ListCollection<T>;
  groups: [string, T[]][];
  grouped: boolean;
  encodedValue: string[];
  selectedValues: V[];
  selectedItems: T[];
  handleValueChange: (details: SelectionValueChangeDetails) => void;
  getItemState: (item: T) => SelectionItemState<V>;
  search: {
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
  groupBy,
  groupSort,
  selectionMode,
  value,
  onValueChange,
  search,
}: UseSelectionControllerParams<T, V>): SelectionController<T, V> {
  const searchOptions: SelectionSearchOptions<T> | undefined =
    typeof search === "object" ? search : search === true ? {} : undefined;
  const searchOptionsRef = useRef(searchOptions);

  useEffect(() => {
    searchOptionsRef.current = searchOptions;
  });

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

  const defaultQuery = searchOptions?.defaultQuery ?? "";
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const query = searchOptions?.query ?? internalQuery;

  const filter = searchOptions?.filter;
  const collection = useMemo(() => {
    const created = createListCollection<T>({
      items: items as T[],
      itemToString: getItemLabel,
      itemToValue: (item) => encodeSelectionValue(getItemValue(item)),
      isItemDisabled,
      groupBy,
      groupSort,
    });
    if (!query) return created;

    return created.filter((itemText, _index, item) =>
      filter ? filter(item, query) : matchesQuery(itemText, query),
    );
  }, [filter, getItemLabel, getItemValue, groupBy, groupSort, isItemDisabled, items, query]);

  const groups = useMemo(() => collection.group(), [collection]);
  const grouped = !(groups.length === 1 && groups[0][0] === "");

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
    groups,
    grouped,
    encodedValue,
    selectedValues,
    selectedItems,
    handleValueChange,
    getItemState,
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
