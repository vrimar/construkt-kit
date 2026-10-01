import { flexRender } from "@tanstack/react-table";

import { Box, Stack } from "#styled-system/jsx";

import { Text } from "../Text";
import { useDataTableContext } from "./context";
import { DataTableStatus } from "./EmptyState";
import type { DataTableInstance } from "./types";

interface DataTableCardsProps<TData extends object> {
  table: DataTableInstance<TData>;
}

/**
 * Mobile layout for DataTable: renders each row as a stacked label/value card
 * instead of the horizontally-scrolling grid. Enabled via `mobileLayout="cards"`.
 */
export const DataTableCards = <TData extends object>({ table }: DataTableCardsProps<TData>) => {
  const { getRowInteractionProps } = useDataTableContext<TData>();
  const rows = table.getRowModel().rows;

  return (
    <Box
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
            _hover={{ bg: "bg.subtle" }}
            {...getRowInteractionProps(row)}
          >
            {row.getVisibleCells().map((cell) => {
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
