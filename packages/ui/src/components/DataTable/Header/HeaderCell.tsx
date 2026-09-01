import { Box } from "@construkt-kit/styled-system/jsx";
import { flexRender } from "@tanstack/react-table";

import { Text } from "../../Text";
import type { DataTableHeader } from "../types";
import { ColumnSorter, columnSorterGutter } from "./ColumnSorter";

interface HeaderCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderCell = <TData extends object>({ header }: HeaderCellProps<TData>) => {
  const column = header.column;
  const isVisible = column.columnDef?.meta?.isVisible ?? true;
  const sortable = column.getCanSort();
  const sort = column.getIsSorted();
  const width = column.columnDef.meta?.width ?? column.getSize();
  const widthPx = width ? `${width}px` : "auto";
  const label = column.columnDef.header;

  // The sorter is out of flow: without this reservation it would overlap a full-width label.
  const labelMaxWidth = sortable ? `calc(100% - ${columnSorterGutter}px)` : "100%";

  if (!isVisible) return null;

  const handleSort = () => {
    if (!sortable) return;

    if (!sort)
      column.toggleSorting(false); // unsorted → asc
    else if (sort === "asc")
      column.toggleSorting(true); // asc → desc
    else column.clearSorting(); // desc → clear
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      key={header.id}
      flex="1"
      px="2"
      py="1"
      fontWeight="medium"
      fontSize="sm"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
      userSelect="none"
      style={{
        minWidth: widthPx,
        maxWidth: widthPx,
      }}
      css={{
        "&:hover .data-table__column-sorter": {
          visibility: "visible",
        },
      }}
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
        <ColumnSorter
          header={header}
          onSort={handleSort}
        />
      </Box>
    </Box>
  );
};
