import { flexRender } from "@tanstack/react-table";

import { Box } from "#styled-system/jsx";

import { GridCell } from "../parts";
import type { DataTableCell } from "../types";

interface BodyCellProps<TData extends object> {
  cell: DataTableCell<TData>;
}

export const BodyCell = <TData extends object>({ cell }: BodyCellProps<TData>) => {
  const align = cell.column.columnDef?.meta?.align ?? "start";
  const titleValue = cell.getValue();

  return (
    <GridCell
      display="flex"
      color="fg"
      style={{ justifyContent: align }}
      title={typeof titleValue === "string" ? titleValue : undefined}
      position="relative"
    >
      <Box truncate>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box>
    </GridCell>
  );
};
