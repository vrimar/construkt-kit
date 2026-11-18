import { flexRender } from "@tanstack/react-table";

import { Box } from "#styled-system/jsx";

import { cellTitle } from "../columns";
import { GridCell } from "../parts";
import type { DataTableCell } from "../types";

interface BodyCellProps<TData extends object> {
  cell: DataTableCell<TData>;
}

export const BodyCell = <TData extends object>({ cell }: BodyCellProps<TData>) => {
  const meta = cell.column.columnDef?.meta;
  const align = meta?.align ?? "start";

  return (
    <GridCell
      display="flex"
      color="fg"
      style={{ justifyContent: align }}
      title={cellTitle(meta, cell.getValue())}
      position="relative"
    >
      {/* Bleeds into the cell padding so the truncation clip spares focus rings. */}
      <Box
        truncate
        px="var(--table-cell-px)"
        py="var(--table-cell-py)"
        mx="calc(var(--table-cell-px) * -1)"
        my="calc(var(--table-cell-py) * -1)"
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </Box>
    </GridCell>
  );
};
