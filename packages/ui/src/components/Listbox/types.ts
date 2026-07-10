import type { ReactNode } from "react";

/** Stable scalar value used to identify a selection item. */
export type SelectionValue = string | number;

export interface SelectionItemsProps<T, V extends SelectionValue> {
  items: readonly T[];
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
}

export interface SingleSelectionProps<V extends SelectionValue> {
  selectionMode?: "single";
  value: V | null;
  onValueChange: (value: V | null) => unknown;
}

export interface MultipleSelectionProps<V extends SelectionValue> {
  selectionMode: "multiple";
  value: readonly V[];
  onValueChange: (value: V[]) => unknown;
}

export type SelectionProps<V extends SelectionValue> =
  | SingleSelectionProps<V>
  | MultipleSelectionProps<V>;

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
  filter?: (item: T, query: string) => boolean;
  /** Render the built-in search input. */
  showInput?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  endElement?: ReactNode;
}

export type SelectionIndicatorPosition = "start" | "end" | "none";

export interface SelectionValueRenderContext<T, V extends SelectionValue> {
  value: V | readonly V[] | null;
  selectedItems: readonly T[];
}
