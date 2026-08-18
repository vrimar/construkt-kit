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

export type ColumnFilterType = "input" | "select" | "date";

export type TableFilterSelections = Record<string, string[]>;

export type ColumnFilterValue = string | string[] | undefined;

export type DataTableFilters = Record<string, string[] | undefined>;

export type DataTableSortType = "asc" | "desc" | "";

export type DataTableSelectProps = Partial<
  Omit<
    ApplySelectProps<string, string>,
    "getItemLabel" | "getItemValue" | "items" | "onValueChange" | "value"
  >
> & {
  getItemLabel?: (item: string) => string;
};

export type DataTableParams = {
  orderBy: string;
  orderType: DataTableSortType;
  page: number;
  pageSize: number;
  filters: DataTableFilters;
};

export type DataTableColumnMeta = {
  type?: ColumnFilterType;
  selectProps?: DataTableSelectProps;
  width?: number;
  isVisible?: boolean;
};

export type DataTableTableMeta = {
  selections: TableFilterSelections | undefined;
};

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

export const dataTableClasses = {
  columnSorter: "data-table__column-sorter",
};
