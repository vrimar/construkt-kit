import { Box, HStack, Text } from "@chakra-ui/react";
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { dataTableClasses } from "../types";
import { ColumnSorter } from "./ColumnSorter";

interface Props<TData> {
  header: Header<TData, unknown>;
}

export const DataTableHeaderCell = <TData,>({ header }: Props<TData>) => {
  const column = header.column;
  const isVisible = column.columnDef?.meta?.isVisible ?? true;
  const sortable = column.getCanSort();
  const sort = column.getIsSorted();
  const width = column.columnDef.meta?.width ?? column.getSize();
  const widthPx = width ? `${width}px` : "auto";

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
      key={header.id}
      flex="1"
      px="2"
      py="1"
      fontWeight="medium"
      fontSize="14px"
      borderRightWidth="1px"
      borderRightColor="border"
      userSelect="none"
      style={{
        minWidth: widthPx,
        maxWidth: widthPx,
      }}
      css={{
        [`&:hover .${dataTableClasses.columnSorter}`]: {
          visibility: "visible",
        },
      }}
    >
      <HStack
        alignItems="center"
        gap="3"
      >
        <Text>{flexRender(column.columnDef.header, header.getContext())}</Text>
        <HStack gap="1">
          <ColumnSorter
            header={header}
            onSort={handleSort}
          />
        </HStack>
      </HStack>
    </Box>
  );
};
