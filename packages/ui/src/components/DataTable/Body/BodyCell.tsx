import { Box } from "@construkt-kit/styled-system/jsx";
import { flexRender } from "@tanstack/react-table";

import type { DataTableCell } from "../types";

interface BodyCellProps<TData extends object> {
  cell: DataTableCell<TData>;
}

export const BodyCell = <TData extends object>({ cell }: BodyCellProps<TData>) => {
  const isVisible = cell.column.columnDef?.meta?.isVisible ?? true;
  const width = cell.column.columnDef?.meta?.width ?? cell.column.getSize();
  const widthPx = width ? `${width}px` : "auto";

  if (!isVisible) return null;

  const titleValue = cell.getValue();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      flex="1"
      p="2"
      fontSize="sm"
      style={{
        minWidth: widthPx,
        maxWidth: widthPx,
      }}
      overflow="hidden"
      title={typeof titleValue === "string" ? titleValue : undefined}
      position="relative"
    >
      <Box truncate>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box>
    </Box>
  );
};
