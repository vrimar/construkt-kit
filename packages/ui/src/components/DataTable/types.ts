import type { Cell, ColumnDef, ColumnHelper, Header, ReactTable, Row } from "@tanstack/react-table";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  createColumnHelper,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

import type { BoxProps } from "#styled-system/jsx";

import type { Unstyled } from "../../types";
import type { ApplySelectProps } from "../Select";
import { dataTableFilterFns } from "./rowModelFns";

export type ColumnFilterType = "input" | "select" | "date" | "number";

export type TableFilterSelections = Record<string, string[]>;

export type { DataTableFilters, DataTableParams, DataTableSortType } from "@construkt-kit/utils";

export type DataTableSelectProps = Partial<
  Unstyled<
    Omit<
      ApplySelectProps<string, string>,
      "getItemLabel" | "getItemValue" | "items" | "onValueChange" | "value"
    >
  >
> & {
  getItemLabel?: (item: string) => string;
};

export type DataTableRowProps = Unstyled<BoxProps>;

export type DataTableColumnAlign = "start" | "center" | "end";

/**
 * Where a column's cell goes in the `mobileLayout="cards"` layout.
 * - `title`: the card's heading. A filterable `input` title column also drives the search box.
 * - `subtitle`: a muted line under the title; several subtitle columns join with " · ".
 * - `detail`: a labelled value in the wrapping grid below the heading.
 * - `actions`: the card's top-right corner, without a label.
 * - `hidden`: left out of the card, still sortable and filterable.
 */
export type DataTableCardRole = "title" | "subtitle" | "detail" | "actions" | "hidden";

export type DataTableColumnMeta = {
  type?: ColumnFilterType;
  selectProps?: DataTableSelectProps;
  width?: number;
  /** Floor for a growing column, in px. Ignored when `width` is set. */
  minWidth?: number;
  isVisible?: boolean;
  /** Aligns body cell content. Header labels stay at the start regardless. */
  align?: DataTableColumnAlign;
  /** The column's place in the mobile card layout. Defaults to `"detail"`. */
  card?: DataTableCardRole;
};

export type DataTableLabels = {
  noResults?: string;
  resetFilters?: string;
  items?: string;
  /** The count's noun when exactly one row matches. Falls back to `items` when only that is set. */
  item?: string;
  page?: string;
  outOf?: string;
  /** Prefix of every column filter placeholder, followed by the column name. */
  filterBy?: string;
  /** Prefix of every sort button's accessible name, followed by the column name. */
  sortBy?: string;
  clearSearch?: string;
  clearNumber?: string;
  clearDate?: string;
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
  /** Mobile cards: the sort button while nothing is sorted. */
  sort?: string;
  /** Mobile cards: the filters button and drawer title. */
  filters?: string;
  ascending?: string;
  descending?: string;
  /** Mobile cards: clears the sort from the sort drawer. */
  clearSort?: string;
  /** Mobile cards: closes the sort and filters drawers. */
  done?: string;
  /** Prefix of an active filter chip's accessible name, followed by the column name. */
  removeFilter?: string;
};

export type ColumnFilterLayout = "cell" | "field";

export interface ColumnFilterProps {
  columnId: string;
  placeholder: string;
  meta: DataTableColumnMeta | undefined;
  value: string[];
  onChange: (value: string[] | undefined) => void;
  layout: ColumnFilterLayout;
  debounceMs: number;
  facetedValues?: Map<unknown, number>;
}

/**
 * Feature set backing {@link DataTable}. The filtered, sorted and paginated row
 * models only run in `clientSide` mode; otherwise the `manual*` options skip them
 * and the data prop is rendered as given. A column's `filterFn` and `sortFn` can
 * name any key of `filterFns` and `sortFns`.
 *
 * Faceting reads every row, not the rows the other filters leave, so a select
 * filter lists all of its options.
 *
 * The meta slot scopes `columnDef.meta` to this table instead of declaration-merging
 * it into every `@tanstack/react-table` consumer.
 */
export const dataTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: dataTableFilterFns,
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  // The slot is typed `object`; dropping this cast silently untypes columnDef.meta.
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** TanStack's column helper bound to {@link DataTableFeatures}, so `meta` is typed as {@link DataTableColumnMeta}. */
export const createDataTableColumnHelper = <TData extends object>(): ColumnHelper<
  DataTableFeatures,
  TData
> => createColumnHelper<DataTableFeatures, TData>();

export type DataTableColumnDef<TData extends object, TValue = unknown> = ColumnDef<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableRow<TData extends object> = Row<DataTableFeatures, TData>;
export type DataTableCell<TData extends object, TValue = unknown> = Cell<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableHeader<TData extends object, TValue = unknown> = Header<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableInstance<TData extends object> = ReactTable<DataTableFeatures, TData>;
