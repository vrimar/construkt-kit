import { Box } from "@construkt-kit/styled-system/jsx";
import type { Table } from "@tanstack/react-table";

import { DataTableHeaderFilterCell } from "./HeaderFilterCell";

interface HeaderFilterRowProps<TData> {
  table: Table<TData>;
}

export const DataTableHeaderFilterRow = <TData,>({ table }: HeaderFilterRowProps<TData>) => {
  const selections = table.options.meta?.selections ?? {};

  const groups = table.getHeaderGroups();

  return (
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
            <DataTableHeaderFilterCell
              key={header.id}
              header={header}
              filterValues={selections[header.id] || []}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};
