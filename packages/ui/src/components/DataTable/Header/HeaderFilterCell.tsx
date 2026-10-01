import type { ComponentType } from "react";

import { Box } from "#styled-system/jsx";

import type { ColumnFilterProps, ColumnFilterType, DataTableHeader } from "../types";
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
          label={typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
          meta={meta}
          value={Array.isArray(filterValue) ? (filterValue as string[]) : []}
          onChange={(value) => column.setFilterValue(value)}
        />
      )}
    </Box>
  );
};
