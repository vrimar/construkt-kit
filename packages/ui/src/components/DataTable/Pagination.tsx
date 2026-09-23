import { HStack } from "@construkt-kit/styled-system/jsx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { IconButton } from "../Buttons";
import { Text } from "../Text";
import { useDataTableContext } from "./context";
import type { DataTableInstance } from "./types";

interface PaginationProps<TData extends object> {
  table: DataTableInstance<TData>;
  totalItems: number;
  size: "xs" | "sm" | "md" | "lg";
}

export const DataTablePagination = <TData extends object>({
  table,
  totalItems,
  size,
}: PaginationProps<TData>) => {
  const { labels } = useDataTableContext();
  const pageCount = table.getPageCount();
  const page = table.state.pagination.pageIndex;

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
          {labels.items}
        </Text>
      </HStack>

      <HStack gap="8">
        {totalItems > 0 ? (
          <Text>
            {labels.page}{" "}
            <Text
              as="span"
              fontWeight="bold"
            >
              {page + 1}
            </Text>{" "}
            {labels.outOf}{" "}
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
            aria-label={labels.firstPage}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            size={size}
          >
            <ChevronsLeftIcon />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label={labels.previousPage}
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            size={size}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            variant="outline"
            aria-label={labels.nextPage}
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            size={size}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            variant="outline"
            aria-label={labels.lastPage}
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
