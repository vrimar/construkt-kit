import type { ColumnFilterValue, DataTableHeader } from "../types";
import { ColumnDateFilter } from "./Filters/ColumnDateFilter";
import { ColumnSearchInput } from "./Filters/ColumnSearchInput";
import { ColumnSelectFilter } from "./Filters/ColumnSelectFilter";

interface HeaderFilterCellContentProps<TData extends object> {
  header: DataTableHeader<TData>;
  filterValues: string[];
  onChange: (value: ColumnFilterValue) => unknown;
}

export const DataTableHeaderFilterCellContent = <TData extends object>({
  header,
  filterValues,
  onChange,
}: HeaderFilterCellContentProps<TData>) => {
  const column = header.column;
  const filterable = column.getCanFilter();
  const name = typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
  const type = column.columnDef.meta?.type || "input";
  const filterValue = column.getFilterValue() as string[];

  const handleChange = (value: ColumnFilterValue) => {
    if (typeof value === "string" && value) value = [value];
    onChange(value);
  };

  if (!filterable) return null;

  switch (type) {
    case "input":
      return (
        <ColumnSearchInput
          name={name}
          onChange={handleChange}
          value={filterValue ? filterValue[0] : ""}
        />
      );
    case "date":
      return (
        <ColumnDateFilter
          dateValue={filterValue ? filterValue[0] : ""}
          onChange={handleChange}
        />
      );
    case "select":
      return (
        <ColumnSelectFilter
          name={name}
          filterValues={filterValues}
          value={filterValue ?? []}
          selectProps={column.columnDef.meta?.selectProps}
          onValueChange={handleChange}
        />
      );
    default:
      return null;
  }
};
