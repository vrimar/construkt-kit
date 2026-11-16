import { getLeafHeaders } from "../columns";
import { GridHead, GridRow } from "../parts";
import type { DataTableInstance } from "../types";
import { DataTableHeaderCell } from "./HeaderCell";
import { DataTableHeaderFilterCell } from "./HeaderFilterCell";

interface DataTableHeaderProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFiltersRow?: boolean;
}

export const DataTableHeader = <TData extends object>({
  table,
  showFiltersRow,
}: DataTableHeaderProps<TData>) => (
  <GridHead
    display="flex"
    flexDirection="column"
    flexShrink="0"
  >
    {table.getHeaderGroups().map((headerGroup) => (
      <GridRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <DataTableHeaderCell
            key={header.id}
            header={header}
          />
        ))}
      </GridRow>
    ))}
    {showFiltersRow && (
      // The filter inputs inherit text styles, so this row undoes the head's header text.
      <GridRow
        color="fg"
        fontWeight="normal"
      >
        {getLeafHeaders(table).map((header) => (
          <DataTableHeaderFilterCell
            key={header.id}
            header={header}
          />
        ))}
      </GridRow>
    )}
  </GridHead>
);
