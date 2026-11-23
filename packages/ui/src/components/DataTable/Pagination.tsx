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
      {totalItems === 1 ? labels.item : labels.items}
    </Text>
  );
}

const steps = {
  first: { Icon: ChevronsLeftIcon, move: "firstPage", forward: false },
  previous: { Icon: ChevronLeftIcon, move: "previousPage", forward: false },
  next: { Icon: ChevronRightIcon, move: "nextPage", forward: true },
  last: { Icon: ChevronsRightIcon, move: "lastPage", forward: true },
} as const;

interface StepButtonProps<TData extends object> {
  table: DataTableInstance<TData>;
  size: NonNullable<IconButtonProps["size"]>;
  step: keyof typeof steps;
}

function StepButton<TData extends object>({ table, size, step }: StepButtonProps<TData>) {
  const { labels } = useDataTableContext();
  const { Icon, move, forward } = steps[step];

  return (
    <IconButton
      variant="outline"
      aria-label={labels[move]}
      onClick={() => table[move]()}
      disabled={forward ? !table.getCanNextPage() : !table.getCanPreviousPage()}
      size={size}
    >
      <Icon />
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
        ps="4"
        pe="2"
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
          {(["first", "previous", "next", "last"] as const).map((step) => (
            <StepButton
              key={step}
              table={table}
              size={size}
              step={step}
            />
          ))}
        </HStack>
      </HStack>
    </HStack>
  );
};
