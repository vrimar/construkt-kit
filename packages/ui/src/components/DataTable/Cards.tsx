import { flexRender } from "@tanstack/react-table";
import React, { useEffect } from "react";

import { Box, Stack } from "#styled-system/jsx";

import { Text } from "../Text";
import { useDataTableContext } from "./context";
import { DataTableStatus } from "./EmptyState";
import type { DataTableInstance, DataTableRow } from "./types";

interface DataTableCardsProps<TData extends object> {
  table: DataTableInstance<TData>;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
}

/**
 * Mobile layout for DataTable: renders each row as a stacked label/value card
 * instead of the horizontally-scrolling grid. Enabled via `mobileLayout="cards"`.
 */
export const DataTableCards = <TData extends object>({
  table,
  renderSubRow,
}: DataTableCardsProps<TData>) => {
  const { getRowInteractionProps } = useDataTableContext<TData>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.state.pagination.pageIndex;
  const headers = new Map(table.getLeafHeaders().map((header) => [header.column.id, header]));

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return (
    <Box
      ref={scrollRef}
      position="relative"
      flex="1"
      minHeight="0"
      overflowY="auto"
      p="2"
    >
      <DataTableStatus
        layout="flow"
        isEmpty={rows.length === 0}
      />
      <Stack gap="2">
        {rows.map((row) => (
          <React.Fragment key={row.id}>
            <Box
              display="flex"
              flexDirection="column"
              gap="2"
              p="3"
              borderWidth="1px"
              borderColor="border"
              borderRadius="md"
              bg="bg"
              _hover={{ bg: "bg.subtle" }}
              css={{ "&[data-clickable]": { cursor: "pointer" } }}
              {...getRowInteractionProps(row)}
            >
              {row.getAllCells().map((cell) => {
                const header = headers.get(cell.column.id);
                const template = cell.column.columnDef.header;
                const label = header && template ? flexRender(template, header.getContext()) : null;
                const content = flexRender(cell.column.columnDef.cell, cell.getContext());

                return (
                  <Box
                    key={cell.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="3"
                  >
                    {/* Panda folds style props derived from `label`; branch in JSX so both stay extractable. */}
                    {label ? (
                      <>
                        <Text
                          fontSize="xs"
                          fontWeight="medium"
                          color="fg.muted"
                          flexShrink="0"
                        >
                          {label}
                        </Text>
                        <Box
                          fontSize="sm"
                          minWidth="0"
                          textAlign="end"
                        >
                          {content}
                        </Box>
                      </>
                    ) : (
                      <Box
                        fontSize="sm"
                        minWidth="0"
                        flex="1"
                        textAlign="start"
                      >
                        {content}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
};
