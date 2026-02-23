import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { SelectProps } from "../Select";

export type ColumnFilterType = "input" | "select" | "date";
export type Column<TData> = {
  filterType?: ColumnFilterType;
} & ColumnDef<TData>;

export type TableFilterSelections = Record<string, string[]>;

export type ColumnFilterValue = string | string[] | undefined;

export type DataTableFilters = Record<string, string[] | undefined>;

export type DataTableSortType = "asc" | "desc" | "";

export type DataTableParams = {
  orderBy: string;
  orderType: DataTableSortType;
  page: number;
  pageSize: number;
  filters: DataTableFilters;
};

import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: ColumnFilterType;
    selectProps?: Partial<SelectProps<string, string>>;
    width?: number;
    isVisible?: boolean;
  }
  interface TableMeta<TData extends RowData> {
    selections: TableFilterSelections | undefined;
  }
}

export const dataTableClasses = {
  columnSorter: "data-table__column-sorter",
};
