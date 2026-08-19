import { HStack } from "@construkt-kit/styled-system/jsx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { IconButton } from "../Buttons";
import { Text } from "../Text";
import type { DataTableInstance } from "./types";

interface PaginationProps<TData extends object> {
  table: DataTableInstance<TData>;
  totalItems: number;
  size: "xs" | "sm" | "md" | "lg";
  labels?: {
    items?: string;
    page?: string;
    outOf?: string;
  };
}

export const DataTablePagination = <TData extends object>({
  table,
  totalItems,
  size,
  labels,
}: PaginationProps<TData>) => {
  const pageCount = table.getPageCount();
  const page = table.state.pagination.pageIndex;
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
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            size={size}
          >
            <ChevronsLeftIcon />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label="Previous page"
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            size={size}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            variant="outline"
            aria-label="Next page"
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            size={size}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label="Last page"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            size={size}
          >
            <ChevronsRightIcon />
          </IconButton>
        </HStack>
      </HStack>
    </HStack>
  );
};
