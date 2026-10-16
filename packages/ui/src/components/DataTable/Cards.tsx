import { flexRender } from "@tanstack/react-table";
import React, { useEffect } from "react";

import { Box, HStack, Stack } from "#styled-system/jsx";

import { DataTableCardsToolbar } from "./CardsToolbar";
import { useDataTableContext } from "./context";
import { DataTableStatus } from "./EmptyState";
import { renderColumnLabel } from "./Header/columnLabel";
import type {
  DataTableCardRole,
  DataTableCell,
  DataTableHeader,
  DataTableInstance,
  DataTableRow,
  DataTableRowProps,
} from "./types";

const cardRole = <TData extends object>(cell: DataTableCell<TData>): DataTableCardRole =>
  cell.column.columnDef.meta?.card ?? "detail";

const renderCell = <TData extends object>(cell: DataTableCell<TData>) =>
  flexRender(cell.column.columnDef.cell, cell.getContext());

interface DataTableCardProps<TData extends object> {
  row: DataTableRow<TData>;
  headers: Map<string, DataTableHeader<TData>>;
  interactionProps: DataTableRowProps;
}

const DataTableCard = <TData extends object>({
  row,
  headers,
  interactionProps,
}: DataTableCardProps<TData>) => {
  const cells = row.getAllCells();
  const withRole = (role: DataTableCardRole) => cells.filter((cell) => cardRole(cell) === role);
  const titles = withRole("title");
  const subtitles = withRole("subtitle");
  const actions = withRole("actions");
  const details = withRole("detail");

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="2.5"
      py="3"
      pl="3.5"
      pr="2"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg"
      _hover={{ bg: "bg.subtle" }}
      css={{ "&[data-clickable]": { cursor: "pointer" } }}
      {...interactionProps}
    >
      {titles.length + subtitles.length + actions.length > 0 && (
        <HStack
          alignItems="flex-start"
          gap="2"
        >
          <Box
            flex="1"
            minWidth="0"
            pt="0.5"
          >
            {titles.map((cell) => (
              <Box
                key={cell.id}
                fontWeight="semibold"
                textStyle="md"
                lineClamp="2"
              >
                {renderCell(cell)}
              </Box>
            ))}
            {subtitles.length > 0 && (
              <Box
                mt="0.5"
                textStyle="sm"
                color="fg.muted"
                truncate
              >
                {subtitles.map((cell, index) => (
                  <React.Fragment key={cell.id}>
                    {index > 0 && " · "}
                    {renderCell(cell)}
                  </React.Fragment>
                ))}
              </Box>
            )}
          </Box>
          {actions.map((cell) => (
            <Box
              key={cell.id}
              flexShrink="0"
            >
              {renderCell(cell)}
            </Box>
          ))}
        </HStack>
      )}

      {details.length > 0 && (
        <Box
          display="flex"
          flexWrap="wrap"
          columnGap="5"
          rowGap="2"
          pr="2"
        >
          {details.map((cell) => {
            const header = headers.get(cell.column.id);
            const label = header ? renderColumnLabel(header) : null;

            return (
              <Box
                key={cell.id}
                display="flex"
                flexDirection="column"
                minWidth="0"
                maxWidth="100%"
              >
                {label && (
                  <Box
                    textStyle="xs"
                    fontWeight="semibold"
                    color="fg.muted"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    truncate
                  >
                    {label}
                  </Box>
                )}
                <Box
                  textStyle="sm"
                  overflowWrap="anywhere"
                >
                  {renderCell(cell)}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

interface DataTableCardsProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFilters: boolean;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
}

/**
 * Mobile layout for DataTable: renders each row as a card laid out by the columns'
 * `meta.card` roles, under a search box, a sort chip and a filters drawer.
 * Enabled via `mobileLayout="cards"`.
 */
export const DataTableCards = <TData extends object>({
  table,
  showFilters,
  renderSubRow,
}: DataTableCardsProps<TData>) => {
  const { getRowInteractionProps } = useDataTableContext<TData>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.state.pagination.pageIndex;
  // `table.getLeafHeaders()` also returns the placeholder and group headers above each leaf.
  const leafHeaders = table.getHeaderGroups().at(-1)?.headers ?? [];
  const headers = new Map(leafHeaders.map((header) => [header.column.id, header]));

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="0"
    >
      <DataTableCardsToolbar
        table={table}
        headers={leafHeaders}
        showFilters={showFilters}
      />
      <Box
        ref={scrollRef}
        position="relative"
        flex="1"
        minHeight="0"
        overflowY="auto"
        px="3"
        pb="3"
      >
        <DataTableStatus
          layout="flow"
          isEmpty={rows.length === 0}
        />
        <Stack gap="2">
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              <DataTableCard
                row={row}
                headers={headers}
                interactionProps={getRowInteractionProps(row)}
              />
              {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
            </React.Fragment>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
