import type { Listbox as ArkListbox } from "@ark-ui/react/listbox";
import type { ReactNode } from "react";

import type { HTMLStyledProps } from "#styled-system/jsx";

/** Stable scalar value used to identify a selection item. */
export type SelectionValue = string | number;

export type SelectionGroupSort = ((a: string, b: string) => number) | string[] | "asc" | "desc";

export type SelectionGroupLabelRenderer<T> = (group: string, items: readonly T[]) => ReactNode;

export interface SelectionItemsProps<T, V extends SelectionValue> {
  items: readonly T[];
  getItemValue: (item: T) => V;
  getItemLabel: (item: T) => string;
  isItemDisabled?: (item: T) => boolean;
  /** Groups items under headings. Disables `virtual`. */
  groupBy?: (item: T, index: number) => string;
  /** Orders the group headings. Defaults to first-seen order. */
  groupSort?: SelectionGroupSort;
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

export type ManagedItemProps = Partial<
  Omit<HTMLStyledProps<typeof ArkListbox.Item>, "children" | "item">
>;

export interface ManagedListOptions<T, V extends SelectionValue> {
  loading?: boolean;
  emptyMessage?: ReactNode;
  indicatorPosition?: SelectionIndicatorPosition;
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderGroupLabel?: SelectionGroupLabelRenderer<T>;
  getItemProps?: (item: T) => ManagedItemProps;
  virtual?: boolean;
}
