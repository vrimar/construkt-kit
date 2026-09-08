import { Box } from "@construkt-kit/styled-system/jsx";

import { gridRowStyle } from "../columnTemplate";
import { type DataTableInstance, dataTableClasses } from "../types";
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
            <DataTableHeaderCell
              key={header.id}
              header={header}
            />
          ))}
        </Box>
      ))}
      {showFiltersRow && <DataTableHeaderFilterRow table={table} />}
    </Box>
  );
};
