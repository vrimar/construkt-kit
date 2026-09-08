import { Box } from "@construkt-kit/styled-system/jsx";

import { gridRowStyle } from "../columnTemplate";
import { type DataTableInstance, dataTableClasses } from "../types";
import { DataTableHeaderFilterCell } from "./HeaderFilterCell";

interface HeaderFilterRowProps<TData extends object> {
  table: DataTableInstance<TData>;
}

export const DataTableHeaderFilterRow = <TData extends object>({
  table,
}: HeaderFilterRowProps<TData>) => {
  const selections = table.options.meta?.selections ?? {};

  const groups = table.getHeaderGroups();

  return groups.map((headerGroup) => (
    <Box
      key={headerGroup.id}
      role="row"
      className={dataTableClasses.row}
      paddingX="2"
      display="grid"
      borderBottomWidth="1px"
      borderColor="border"
      style={gridRowStyle}
    >
      {headerGroup.headers.map((header) => (
        <DataTableHeaderFilterCell
          key={header.id}
          header={header}
          filterValues={selections[header.id] || []}
        />
      ))}
    </Box>
  ));
};
