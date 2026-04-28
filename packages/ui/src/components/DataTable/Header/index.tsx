import { Box } from "@construkt-kit/styled-system/jsx";
import type { Table } from "@tanstack/react-table";

import { DataTableHeaderCell } from "./HeaderCell";
import { DataTableHeaderFilterRow } from "./HeaderFilterRow";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  showFiltersRow?: boolean;
}

export const DataTableHeader = <TData,>({ table, showFiltersRow }: DataTableHeaderProps<TData>) => {
  const groups = table.getHeaderGroups();

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        width="100%"
      >
        {groups.map((headerGroup) => (
          <Box
            key={headerGroup.id}
            paddingX="2"
            display="flex"
            width="100%"
            borderBottomWidth="1px"
            borderColor="border"
          >
            {headerGroup.headers.map((header) => (
              <DataTableHeaderCell
                key={header.id}
                header={header}
              />
            ))}
          </Box>
        ))}
      </Box>
      {showFiltersRow && <DataTableHeaderFilterRow table={table} />}
    </Box>
  );
};
