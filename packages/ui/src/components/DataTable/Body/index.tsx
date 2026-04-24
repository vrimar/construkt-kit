import type { Row, Table } from "@tanstack/react-table";
import { RefreshCwIcon } from "lucide-react";
import React, { useEffect } from "react";
import { Box, type BoxProps, Stack } from "@b3/styled-system/jsx";

import { Button } from "../../Buttons";
import { LoadingOverlay } from "../../LoadingOverlay";
import { ScrollArea } from "../../ScrollArea";
import { Text } from "../../Text";
import { BodyCell } from "./BodyCell";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  onRowClick: (e: React.MouseEvent<HTMLDivElement>, row: Row<TData>) => void;
  loading: boolean;
  getRowProps?: (row: Row<TData>) => BoxProps;
  onReset?: () => unknown;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  labels?: {
    noResults?: string;
    resetFilters?: string;
  };
}

export const DataTableBody = <TData,>({
  table,
  loading,
  onRowClick,
  getRowProps,
  onReset,
  renderSubRow,
  labels,
}: DataTableBodyProps<TData>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.getState().pagination.pageIndex;
  const hasEmptyMessage = rows.length === 0 && !loading;
  const noResultsLabel = labels?.noResults ?? "No results available.";
  const resetFiltersLabel = labels?.resetFilters ?? "Reset filters";

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return (
    <ScrollArea
      flex="1"
      minHeight="0"
      py="2"
      ref={scrollRef}
    >
      <LoadingOverlay isActive={loading} />
      {hasEmptyMessage && (
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack>
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
      {rows.map((row) => {
        return (
          <React.Fragment key={row.id}>
            <Box
              display="flex"
              paddingX="2"
              width="100%"
              onClick={(e) => onRowClick(e, row)}
              borderBottomWidth="1px"
              borderBottomColor="border"
              cursor="pointer"
              _last={{
                borderBottom: "none",
              }}
              _hover={{
                bg: "bg.subtle",
              }}
              {...getRowProps?.(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <BodyCell
                  key={cell.id}
                  cell={cell}
                />
              ))}
            </Box>

            {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
          </React.Fragment>
        );
      })}
    </ScrollArea>
  );
};
