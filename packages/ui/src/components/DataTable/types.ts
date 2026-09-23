import type { Cell, ColumnDef, Header, ReactTable, Row } from "@tanstack/react-table";
import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

import type { ApplySelectProps } from "../ApplySelect";

export type ColumnFilterType = "input" | "select" | "date" | "number";

export type TableFilterSelections = Record<string, string[]>;

export type { DataTableFilters, DataTableParams, DataTableSortType } from "@construkt-kit/utils";

export type DataTableSelectProps = Partial<
  Omit<
    ApplySelectProps<string, string>,
    "getItemLabel" | "getItemValue" | "items" | "onValueChange" | "value"
  >
> & {
  getItemLabel?: (item: string) => string;
};

export type DataTableColumnAlign = "start" | "center" | "end";

export type DataTableColumnMeta = {
  type?: ColumnFilterType;
  selectProps?: DataTableSelectProps;
  width?: number;
  /** Floor for a growing column, in px. Ignored when `width` is set. */
  minWidth?: number;
  isVisible?: boolean;
  /** Aligns body cell content. Header labels stay at the start regardless. */
  align?: DataTableColumnAlign;
};

export type DataTableTableMeta = {
  selections: TableFilterSelections | undefined;
};

export type DataTableLabels = {
  noResults?: string;
  resetFilters?: string;
  items?: string;
  page?: string;
  outOf?: string;
  /** Prefix of every column filter placeholder, followed by the column name. */
  filterBy?: string;
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
};

export interface ColumnFilterProps {
  columnId: string;
  label: string;
  meta: DataTableColumnMeta | undefined;
  value: string[];
  onChange: (value: string[] | undefined) => void;
}

/**
 * Feature set backing {@link DataTable}. Sorting, filtering and pagination are
 * registered for their APIs only — the table drives all three from `params`, so
 * no row models are registered and the data prop is rendered as given.
 *
 * The meta slots scope `columnDef.meta`/`options.meta` to this table instead of
 * declaration-merging them into every `@tanstack/react-table` consumer.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  // The slots are typed `object`; dropping these casts silently untypes columnDef.meta.
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
  columnMeta: {} as DataTableColumnMeta,
  tableMeta: {} as DataTableTableMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

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
