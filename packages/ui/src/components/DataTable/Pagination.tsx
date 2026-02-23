import { HStack, Text } from "@chakra-ui/react";

import { IconButton } from "../Buttons";
import type { Table } from "@tanstack/react-table";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

interface Props<TData> {
  table: Table<TData>;
  totalItems: number;
  size: "xs" | "sm" | "md" | "lg";
  labels?: {
    items?: string;
    page?: string;
    outOf?: string;
  };
}

export const DataTablePagination = <TData,>({
  table,
  totalItems,
  size = "md",
  labels,
}: Props<TData>) => {
  const pageCount = table.getPageCount();
  const page = table.getState().pagination.pageIndex;
  const itemsLabel = labels?.items ?? "Items";
  const pageLabel = labels?.page ?? "Page";
  const outOfLabel = labels?.outOf ?? "out of";

  return (
    <HStack
      borderTopWidth="1px"
      alignContent="center"
      justifyContent="space-between"
      paddingX="4"
      paddingY="2"
    >
      <HStack
        gap="4"
        height="100%"
      >
        <Text fontSize="16px">
          <b>{totalItems} </b>
          {itemsLabel}
        </Text>
      </HStack>

      <HStack gap="8">
        {totalItems > 0 ? (
          <Text>
            {pageLabel} <b>{page + 1}</b> {outOfLabel} <b>{pageCount}</b>
          </Text>
        ) : (
          <Text>-</Text>
        )}
        <HStack alignSelf="flex-end">
          <IconButton
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<FiChevronsLeft />}
            size={size}
          />
          <IconButton
            variant="outline"
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            icon={<FiChevronLeft />}
            size={size}
          />

          <IconButton
            variant="outline"
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            icon={<FiChevronRight />}
            size={size}
          />
          <IconButton
            variant="outline"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            icon={<FiChevronsRight />}
            size={size}
          />
        </HStack>
      </HStack>
    </HStack>
  );
};
