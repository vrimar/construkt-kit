import type { ComponentType } from "react";

import { Box } from "#styled-system/jsx";

import { useDataTableContext } from "../context";
import type { ColumnFilterProps, ColumnFilterType, DataTableHeader } from "../types";
import { getColumnLabel } from "./columnLabel";
import { ColumnDateFilter } from "./Filters/ColumnDateFilter";
import { ColumnNumberFilter } from "./Filters/ColumnNumberFilter";
import { ColumnSearchInput } from "./Filters/ColumnSearchInput";
import { ColumnSelectFilter } from "./Filters/ColumnSelectFilter";

const columnFilters: Record<ColumnFilterType, ComponentType<ColumnFilterProps>> = {
  input: ColumnSearchInput,
  date: ColumnDateFilter,
  number: ColumnNumberFilter,
  select: ColumnSelectFilter,
};

interface HeaderFilterCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderFilterCell = <TData extends object>({
  header,
}: HeaderFilterCellProps<TData>) => {
  const { labels } = useDataTableContext();
  const column = header.column;
  const { meta } = column.columnDef;
  const ColumnFilter = columnFilters[meta?.type ?? "input"];
  const filterValue = column.getFilterValue();

  return (
    <Box
      role="cell"
      display="flex"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
    >
      {column.getCanFilter() && (
        <ColumnFilter
          columnId={column.id}
          placeholder={`${labels.filterBy} ${getColumnLabel(header)}`}
          meta={meta}
          value={Array.isArray(filterValue) ? (filterValue as string[]) : []}
          onChange={(value) => column.setFilterValue(value)}
        />
      )}
    </Box>
  );
};
