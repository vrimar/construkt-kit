import type { ReactNode } from "react";

/** Stable scalar value used to identify a selection item. */
export type SelectionValue = string | number;

export type SelectionGroupSort = ((a: string, b: string) => number) | string[] | "asc" | "desc";

export type SelectionGroupLabelRenderer<T> = (group: string, items: readonly T[]) => ReactNode;

/** The items a list offers and how to read each one. */
export interface SelectionItemSource<T, V extends SelectionValue> {
  items: readonly T[];
  /** Compared by identity, as are `getItemLabel` and `isItemDisabled`: a new one re-reads every item. */
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: ((item: T) => boolean) | undefined;
}

export interface SelectionItemsProps<T, V extends SelectionValue> extends SelectionItemSource<
  T,
  V
> {
  /** Groups items under headings. Disables `virtual`. */
  groupBy?: (item: T, index: number) => string;
  /** Orders the group headings. Defaults to first-seen order. */
  groupSort?: SelectionGroupSort;
}

export interface ManagedSelectionProps<T, V extends SelectionValue> extends SelectionItemsProps<
  T,
  V
> {
  search?: boolean | SelectionSearchOptions<T>;
}

export type SelectionMode = "single" | "multiple";

export interface SingleSelectionProps<V extends SelectionValue> {
  selectionMode?: "single";
  value: V | null;
  onValueChange: (value: V) => unknown;
}

export interface MultipleSelectionProps<V extends SelectionValue> {
  selectionMode: "multiple";
  value: readonly V[];
  onValueChange: (value: V[]) => unknown;
}

interface SelectionPropsByMode<V extends SelectionValue> {
  single: SingleSelectionProps<V>;
  multiple: MultipleSelectionProps<V>;
}

/**
 * Selection props for one mode. Passing `SelectionMode` gives a union of modes, which `Omit` and
 * `Pick` can't resolve once style props join it.
 */
export type SelectionProps<
  V extends SelectionValue,
  M extends SelectionMode = "single",
> = SelectionPropsByMode<V>[M];

export interface SelectionItemState<V extends SelectionValue> {
  value: V;
  selected: boolean;
  disabled: boolean;
}

export interface SelectionSearchOptions<T> {
  /** Controlled query. */
  query?: string;
  /** Initial/reset query for uncontrolled search. @default "" */
  defaultQuery?: string;
  onQueryChange?: (query: string) => unknown;
  /**
   * `"filter"` filters the items by the query. `"external"` shows the items as given, so the
   * consumer filters them (e.g. server-side) from `onQueryChange`. @default "filter"
   */
  mode?: "filter" | "external";
  /**
   * Receives the trimmed, lowercased query. Not called while the query is blank or in
   * `"external"` mode.
   */
  filter?: (item: T, query: string) => boolean;
  /** Render the built-in search input. */
  showInput?: boolean;
  placeholder?: string;
  /**
   * Focuses the search as the list mounts. The `Select` family focuses its search on open unless
   * this is `false`, which focuses the list instead.
   */
  autoFocus?: boolean;
  endElement?: ReactNode;
}

export interface SelectionValueRenderContext<T, V extends SelectionValue> {
  value: V | readonly V[] | null;
  selectedItems: readonly T[];
}
