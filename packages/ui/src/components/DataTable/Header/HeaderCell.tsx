import { flexRender } from "@tanstack/react-table";

import { Box } from "#styled-system/jsx";

import { Text } from "../../Text";
import type { DataTableHeader } from "../types";
import { ColumnSorter, columnSorterGutter } from "./ColumnSorter";

interface HeaderCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderCell = <TData extends object>({ header }: HeaderCellProps<TData>) => {
  const column = header.column;
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
      aria-sort={ariaSort}
      display="flex"
      alignItems="center"
      key={header.id}
      px="2"
      py="1"
      fontWeight="medium"
      fontSize="sm"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
      userSelect="none"
    >
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        minWidth="0"
        style={{ maxWidth: labelMaxWidth }}
      >
        <Text
          truncate
          title={typeof label === "string" ? label : undefined}
        >
          {flexRender(label, header.getContext())}
        </Text>
        <ColumnSorter header={header} />
      </Box>
    </Box>
  );
};
