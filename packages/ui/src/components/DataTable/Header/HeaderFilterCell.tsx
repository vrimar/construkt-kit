import { GridHeader } from "../parts";
import type { DataTableHeader } from "../types";
import { ColumnFilter } from "./Filters/ColumnFilter";

interface HeaderFilterCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

// A header slot, not a cell: cells in the head's last row lose their bottom rule.
export const DataTableHeaderFilterCell = <TData extends object>({
  header,
}: HeaderFilterCellProps<TData>) => (
  <GridHeader
    role="cell"
    display="flex"
    p="0"
    borderInlineEndWidth="1px"
    borderInlineEndColor="border"
    overflow="hidden"
  >
    {header.column.getCanFilter() && (
      <ColumnFilter
        header={header}
        layout="cell"
      />
    )}
  </GridHeader>
);
