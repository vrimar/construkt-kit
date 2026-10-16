import { Box } from "#styled-system/jsx";

import type { DataTableHeader } from "../types";
import { ColumnFilter } from "./Filters/ColumnFilter";

interface HeaderFilterCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderFilterCell = <TData extends object>({
  header,
}: HeaderFilterCellProps<TData>) => (
  <Box
    role="cell"
    display="flex"
    borderRightWidth="1px"
    borderRightColor="border"
    overflow="hidden"
  >
    {header.column.getCanFilter() && (
      <ColumnFilter
        header={header}
        layout="cell"
      />
    )}
  </Box>
);
