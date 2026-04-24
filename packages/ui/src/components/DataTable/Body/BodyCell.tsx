import { type Cell, flexRender } from "@tanstack/react-table";
import { Box } from "@b3/styled-system/jsx";

interface BodyCellProps<TData> {
  cell: Cell<TData, unknown>;
}

export const BodyCell = <TData,>({ cell }: BodyCellProps<TData>) => {
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
