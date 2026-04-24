import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { HStack } from "@b3/styled-system/jsx";

import { IconButton } from "../Buttons";
import { Text } from "../Text";

interface PaginationProps<TData> {
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
  labels,
}: PaginationProps<TData>) => {
  const pageCount = table.getPageCount();
  const page = table.getState().pagination.pageIndex;
  const itemsLabel = labels?.items ?? "Items";
  const pageLabel = labels?.page ?? "Page";
  const outOfLabel = labels?.outOf ?? "out of";

  return (
    <HStack
      borderTopWidth="1px"
      alignItems="center"
      justifyContent="space-between"
      paddingX="4"
      paddingY="2"
    >
      <HStack
        gap="4"
        height="100%"
      >
        <Text textStyle="md">
          <Text
            as="span"
            fontWeight="bold"
          >
            {totalItems}{" "}
          </Text>
          {itemsLabel}
        </Text>
      </HStack>

      <HStack gap="8">
        {totalItems > 0 ? (
          <Text>
            {pageLabel}{" "}
            <Text
              as="span"
              fontWeight="bold"
            >
              {page + 1}
            </Text>{" "}
            {outOfLabel}{" "}
            <Text
              as="span"
              fontWeight="bold"
            >
              {pageCount}
            </Text>
          </Text>
        ) : (
          <Text>-</Text>
        )}
        <HStack alignSelf="flex-end">
          <IconButton
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            size="sm"
          >
            <ChevronsLeftIcon />
          </IconButton>
          <IconButton
            variant="outline"
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            size="sm"
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            variant="outline"
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            size="sm"
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            variant="outline"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            size="sm"
          >
            <ChevronsRightIcon />
          </IconButton>
        </HStack>
      </HStack>
    </HStack>
  );
};
