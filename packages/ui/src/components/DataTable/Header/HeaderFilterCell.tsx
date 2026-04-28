import { Box } from "@construkt-kit/styled-system/jsx";
import type { Header } from "@tanstack/react-table";

import type { ColumnFilterValue } from "../types";
import { DataTableHeaderFilterCellContent } from "./HeaderFilterCellContent";

interface HeaderFilterCellProps<TData> {
  header: Header<TData, unknown>;
  filterValues: string[];
}

export const DataTableHeaderFilterCell = <TData,>({
  header,
  filterValues,
}: HeaderFilterCellProps<TData>) => {
  const column = header.column;
  const isVisible = column.columnDef?.meta?.isVisible ?? true;
  const width = column.columnDef?.meta?.width ?? column.getSize();
  const widthPx = width ? `${width}px` : "auto";

  if (!isVisible) return null;

  const handleChange = (value: ColumnFilterValue) => column.setFilterValue(value);

  return (
    <Box
      key={header.id}
      display="flex"
      flex="1"
      fontWeight="medium"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
      style={{
        minWidth: widthPx,
        maxWidth: widthPx,
      }}
    >
      <DataTableHeaderFilterCellContent
        header={header}
        filterValues={filterValues}
        onChange={handleChange}
      />
    </Box>
  );
};
