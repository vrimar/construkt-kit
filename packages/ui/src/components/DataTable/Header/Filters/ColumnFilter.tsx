import type { ComponentType } from "react";

import { useDataTableContext } from "../../context";
import type {
  ColumnFilterLayout,
  ColumnFilterProps,
  ColumnFilterType,
  DataTableHeader,
} from "../../types";
import { getColumnLabel } from "../columnLabel";
import { ColumnDateFilter } from "./ColumnDateFilter";
import { ColumnNumberFilter } from "./ColumnNumberFilter";
import { ColumnSearchInput } from "./ColumnSearchInput";
import { ColumnSelectFilter } from "./ColumnSelectFilter";

const columnFilters: Record<ColumnFilterType, ComponentType<ColumnFilterProps>> = {
  input: ColumnSearchInput,
  date: ColumnDateFilter,
  number: ColumnNumberFilter,
  select: ColumnSelectFilter,
};

interface ColumnFilterControlProps<TData extends object> {
  header: DataTableHeader<TData>;
  layout: ColumnFilterLayout;
}

export const ColumnFilter = <TData extends object>({
  header,
  layout,
}: ColumnFilterControlProps<TData>) => {
  const { labels } = useDataTableContext();
  const column = header.column;
  const { meta } = column.columnDef;
  const Filter = columnFilters[meta?.type ?? "input"];
  const filterValue = column.getFilterValue();

  return (
    <Filter
      columnId={column.id}
      placeholder={`${labels.filterBy} ${getColumnLabel(header)}`}
      meta={meta}
      value={Array.isArray(filterValue) ? (filterValue as string[]) : []}
      onChange={(value) => column.setFilterValue(value)}
      layout={layout}
    />
  );
};
