import { Box } from "@construkt-kit/styled-system/jsx";

import { DataTableGridRow } from "../GridRow";
import type { DataTableInstance } from "../types";
import { DataTableHeaderCell } from "./HeaderCell";
import { DataTableHeaderFilterRow } from "./HeaderFilterRow";

interface DataTableHeaderProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFiltersRow?: boolean;
}

export const DataTableHeader = <TData extends object>({
  table,
  showFiltersRow,
}: DataTableHeaderProps<TData>) => {
  const groups = table.getHeaderGroups();

  return (
    <Box
      role="rowgroup"
      display="flex"
      flexDirection="column"
      flexShrink="0"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg"
    >
      {groups.map((headerGroup) => (
        <DataTableGridRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <DataTableHeaderCell
              key={header.id}
              header={header}
            />
          ))}
        </DataTableGridRow>
      ))}
      {showFiltersRow && <DataTableHeaderFilterRow table={table} />}
    </Box>
  );
};
