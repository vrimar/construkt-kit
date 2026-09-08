import { Box } from "@construkt-kit/styled-system/jsx";

import type { ColumnFilterValue, DataTableHeader } from "../types";
import { DataTableHeaderFilterCellContent } from "./HeaderFilterCellContent";

interface HeaderFilterCellProps<TData extends object> {
  header: DataTableHeader<TData>;
  filterValues: string[];
}

export const DataTableHeaderFilterCell = <TData extends object>({
  header,
  filterValues,
}: HeaderFilterCellProps<TData>) => {
  const column = header.column;

  const handleChange = (value: ColumnFilterValue) => column.setFilterValue(value);

  return (
    <Box
      key={header.id}
      role="cell"
      display="flex"
      fontWeight="medium"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
    >
      <DataTableHeaderFilterCellContent
        header={header}
        filterValues={filterValues}
        onChange={handleChange}
      />
    </Box>
  );
};
