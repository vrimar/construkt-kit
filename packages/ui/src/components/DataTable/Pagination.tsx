import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { HStack } from "#styled-system/jsx";

import { IconButton, type IconButtonProps } from "../Buttons";
import { Text } from "../Text";
import { useDataTableContext } from "./context";
import type { DataTableInstance } from "./types";

interface PaginationProps<TData extends object> {
  table: DataTableInstance<TData>;
  size: NonNullable<IconButtonProps["size"]>;
  compact?: boolean;
}

function ItemCount({ totalItems, compact }: { totalItems: number; compact: boolean }) {
  const { labels } = useDataTableContext();

  return (
    <Text textStyle={compact ? "sm" : "md"}>
      <Text
        as="span"
        fontWeight="bold"
      >
        {totalItems}{" "}
      </Text>
      {labels.items}
    </Text>
  );
}

interface StepButtonProps<TData extends object> {
  table: DataTableInstance<TData>;
  size: NonNullable<IconButtonProps["size"]>;
  step: "previous" | "next";
}

function StepButton<TData extends object>({ table, size, step }: StepButtonProps<TData>) {
  const { labels } = useDataTableContext();
  const previous = step === "previous";

  return (
    <IconButton
      variant="outline"
      aria-label={previous ? labels.previousPage : labels.nextPage}
      onClick={previous ? table.previousPage : table.nextPage}
      disabled={previous ? !table.getCanPreviousPage() : !table.getCanNextPage()}
      size={size}
    >
      {previous ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </IconButton>
  );
}

export const DataTablePagination = <TData extends object>({
  table,
  size,
  compact,
}: PaginationProps<TData>) => {
  const { labels } = useDataTableContext();
  const totalItems = table.getRowCount();
  const pageCount = table.getPageCount();
  const page = table.state.pagination.pageIndex;

  if (compact)
    return (
      <HStack
        borderTopWidth="1px"
        justifyContent="space-between"
        pl="4"
        pr="2"
        py="1.5"
      >
        <ItemCount
          totalItems={totalItems}
          compact
        />
        <HStack gap="1">
          <StepButton
            table={table}
            size={size}
            step="previous"
          />
          <Text
            textStyle="sm"
            minWidth="14"
            textAlign="center"
            fontVariantNumeric="tabular-nums"
          >
            {totalItems > 0 ? `${page + 1} / ${pageCount}` : "-"}
          </Text>
          <StepButton
            table={table}
            size={size}
            step="next"
          />
        </HStack>
      </HStack>
    );

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
        <ItemCount
          totalItems={totalItems}
          compact={false}
        />
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
          <StepButton
            table={table}
            size={size}
            step="previous"
          />
          <StepButton
            table={table}
            size={size}
            step="next"
          />
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
