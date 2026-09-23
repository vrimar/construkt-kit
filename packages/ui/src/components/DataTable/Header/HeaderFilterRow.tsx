import { DataTableGridRow } from "../GridRow";
import type { DataTableInstance } from "../types";
import { DataTableHeaderFilterCell } from "./HeaderFilterCell";

interface HeaderFilterRowProps<TData extends object> {
  table: DataTableInstance<TData>;
}

export const DataTableHeaderFilterRow = <TData extends object>({
  table,
}: HeaderFilterRowProps<TData>) =>
  table.getHeaderGroups().map((headerGroup) => (
    <DataTableGridRow key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <DataTableHeaderFilterCell
          key={header.id}
          header={header}
        />
      ))}
    </DataTableGridRow>
  ));
