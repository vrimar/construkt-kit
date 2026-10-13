import { Box } from "#styled-system/jsx";

import { DataTableGridRow } from "../GridRow";
import type { DataTableInstance } from "../types";
import { DataTableHeaderCell } from "./HeaderCell";
import { DataTableHeaderFilterCell } from "./HeaderFilterCell";

interface DataTableHeaderProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFiltersRow?: boolean;
}

export const DataTableHeader = <TData extends object>({
  table,
  showFiltersRow,
}: DataTableHeaderProps<TData>) => {
  const groups = table.getHeaderGroups();
  // `table.getLeafHeaders()` also returns the placeholder and group headers above each leaf.
  const leafHeaders = groups.at(-1)?.headers ?? [];

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
      {showFiltersRow && (
        <DataTableGridRow>
          {leafHeaders.map((header) => (
            <DataTableHeaderFilterCell
              key={header.id}
              header={header}
            />
          ))}
        </DataTableGridRow>
      )}
    </Box>
  );
};
