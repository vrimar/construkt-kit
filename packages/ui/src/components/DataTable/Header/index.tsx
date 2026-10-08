import type { ComponentType } from "react";

import { Box } from "#styled-system/jsx";

import { DataTableGridRow } from "../GridRow";
import type { DataTableInstance, DataTableHeader as HeaderModel } from "../types";
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

  const renderRows = (Cell: ComponentType<{ header: HeaderModel<TData> }>) =>
    groups.map((headerGroup) => (
      <DataTableGridRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <Cell
            key={header.id}
            header={header}
          />
        ))}
      </DataTableGridRow>
    ));

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
      {renderRows(DataTableHeaderCell)}
      {showFiltersRow && renderRows(DataTableHeaderFilterCell)}
    </Box>
  );
};
