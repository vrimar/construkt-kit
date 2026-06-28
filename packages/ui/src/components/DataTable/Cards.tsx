import { Box, type BoxProps, Stack } from "@construkt-kit/styled-system/jsx";
import { type Row, type Table, flexRender } from "@tanstack/react-table";
import { RefreshCwIcon } from "lucide-react";
import type React from "react";

import { Button } from "../Buttons";
import { LoadingOverlay } from "../LoadingOverlay";
import { Text } from "../Text";

interface DataTableCardsProps<TData> {
  table: Table<TData>;
  loading: boolean;
  onRowClick: (e: React.MouseEvent<HTMLDivElement>, row: Row<TData>) => void;
  getRowProps?: (row: Row<TData>) => BoxProps;
  onReset?: () => unknown;
  labels?: {
    noResults?: string;
    resetFilters?: string;
  };
}

/**
 * Mobile layout for DataTable: renders each row as a stacked label/value card
 * instead of the horizontally-scrolling grid. Enabled via `mobileLayout="cards"`.
 */
export const DataTableCards = <TData,>({
  table,
  loading,
  onRowClick,
  getRowProps,
  onReset,
  labels,
}: DataTableCardsProps<TData>) => {
  const rows = table.getRowModel().rows;
  const hasEmptyMessage = rows.length === 0 && !loading;
  const noResultsLabel = labels?.noResults ?? "No results available.";
  const resetFiltersLabel = labels?.resetFilters ?? "Reset filters";

  return (
    <Box
      position="relative"
      flex="1"
      minHeight="0"
      overflowY="auto"
      p="2"
    >
      <LoadingOverlay isActive={loading} />
      {hasEmptyMessage && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          py="10"
        >
          <Stack alignItems="center">
            <Text fontSize="lg">{noResultsLabel}</Text>
            {onReset && (
              <Button
                variant="outline"
                size="lg"
                onClick={onReset}
              >
                <RefreshCwIcon />
                {resetFiltersLabel}
              </Button>
            )}
          </Stack>
        </Box>
      )}
      <Stack gap="2">
        {rows.map((row) => (
          <Box
            key={row.id}
            display="flex"
            flexDirection="column"
            gap="2"
            p="3"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            bg="bg"
            cursor="pointer"
            _hover={{ bg: "bg.subtle" }}
            onClick={(e) => onRowClick(e, row)}
            {...getRowProps?.(row)}
          >
            {row.getVisibleCells().map((cell) => {
              const isVisible = cell.column.columnDef?.meta?.isVisible ?? true;
              if (!isVisible) return null;

              const header = cell.column.columnDef.header;
              const label = typeof header === "string" ? header : null;

              return (
                <Box
                  key={cell.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="3"
                >
                  {label && (
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="fg.muted"
                      flexShrink="0"
                    >
                      {label}
                    </Text>
                  )}
                  <Box
                    fontSize="sm"
                    minWidth="0"
                    flex={label ? undefined : "1"}
                    textAlign={label ? "end" : "start"}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
