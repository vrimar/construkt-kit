import { ApplySelect } from "../../ApplySelect";
import type { Header } from "@tanstack/react-table";

import type { ColumnFilterValue } from "../types";
import { ColumnDateFilter } from "./Filters/ColumnDateFilter";
import { ColumnSearchInput } from "./Filters/ColumnSearchInput";

interface Props<TData> {
  header: Header<TData, unknown>;
  filterValues: string[];
  onChange: (value: ColumnFilterValue) => unknown;
}

export const DataTableHeaderFilterCellContent = <TData,>({
  header,
  filterValues,
  onChange,
}: Props<TData>) => {
  const column = header.column;
  const filterable = column.getCanFilter();
  const name = column.columnDef.header as string;
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
        <ApplySelect
          items={filterValues}
          selected={filterValue}
          getLabel={(item) => item}
          getValue={(item) => item}
          onApply={handleChange}
          cancelText="Reset"
          placement="bottom-end"
          triggerProps={{ size: "sm", width: "100%", variant: "ghost" }}
          {...column.columnDef.meta?.selectProps}
        />
      );
    default:
      return null;
  }
};
