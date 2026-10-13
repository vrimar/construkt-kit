import { flexRender } from "@tanstack/react-table";
import { useId } from "react";

import { Box } from "#styled-system/jsx";

import { Text } from "../../Text";
import type { DataTableHeader } from "../types";
import { ColumnSorter, columnSorterGutter } from "./ColumnSorter";

interface HeaderCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderCell = <TData extends object>({ header }: HeaderCellProps<TData>) => {
  const labelId = useId();
  const { column, colSpan, isPlaceholder } = header;
  const sortable = column.getCanSort();
  const sort = column.getIsSorted();
  const label = column.columnDef.header;
  const ariaSort = sort
    ? sort === "asc"
      ? "ascending"
      : "descending"
    : sortable
      ? "none"
      : undefined;

  // The sorter is out of flow: without this reservation it would overlap a full-width label.
  const labelMaxWidth = sortable ? `calc(100% - ${columnSorterGutter}px)` : "100%";

  return (
    <Box
      role="columnheader"
      aria-sort={isPlaceholder ? undefined : ariaSort}
      aria-labelledby={isPlaceholder ? undefined : labelId}
      aria-colspan={colSpan > 1 ? colSpan : undefined}
      display="flex"
      alignItems="center"
      px="2"
      py="1"
      fontWeight="medium"
      fontSize="sm"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
      userSelect="none"
      style={{ gridColumn: `span ${colSpan}` }}
    >
      {!isPlaceholder && (
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          minWidth="0"
          style={{ maxWidth: labelMaxWidth }}
        >
          <Text
            id={labelId}
            truncate
            title={typeof label === "string" ? label : undefined}
          >
            {flexRender(label, header.getContext())}
          </Text>
          <ColumnSorter header={header} />
        </Box>
      )}
    </Box>
  );
};
