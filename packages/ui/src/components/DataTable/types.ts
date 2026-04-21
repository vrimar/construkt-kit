import type { ColumnDef, RowData } from "@tanstack/react-table";
import "@tanstack/react-table";
import type {
  ApplySelectActionsProps,
  ApplySelectContentProps,
  ApplySelectRootProps,
  ApplySelectSearchProps,
  ApplySelectTriggerProps,
} from "../ApplySelect";
import type { SelectListProps } from "../Select";

export type ColumnFilterType = "input" | "select" | "date";
export type Column<TData> = {
  filterType?: ColumnFilterType;
} & ColumnDef<TData>;

export type TableFilterSelections = Record<string, string[]>;

export type ColumnFilterValue = string | string[] | undefined;

export type DataTableFilters = Record<string, string[] | undefined>;

export type DataTableSortType = "asc" | "desc" | "";

export type DataTableSelectProps = {
  actions?: ApplySelectActionsProps;
  content?: ApplySelectContentProps;
  list?: SelectListProps;
  root?: Partial<
    Omit<
      ApplySelectRootProps<string>,
      "children" | "getLabel" | "getValue" | "items" | "onApply" | "selected"
    >
  >;
  search?: ApplySelectSearchProps;
  trigger?: ApplySelectTriggerProps;
};

export type DataTableParams = {
  orderBy: string;
  orderType: DataTableSortType;
  page: number;
  pageSize: number;
  filters: DataTableFilters;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: ColumnFilterType;
    selectProps?: DataTableSelectProps;
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
