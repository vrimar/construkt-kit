import type { Header } from "@tanstack/react-table";
import { ApplySelect } from "../../ApplySelect";

import type { ColumnFilterValue } from "../types";
import { ColumnDateFilter } from "./Filters/ColumnDateFilter";
import { ColumnSearchInput } from "./Filters/ColumnSearchInput";

interface HeaderFilterCellContentProps<TData> {
  header: Header<TData, unknown>;
  filterValues: string[];
  onChange: (value: ColumnFilterValue) => unknown;
}

export const DataTableHeaderFilterCellContent = <TData,>({
  header,
  filterValues,
  onChange,
}: HeaderFilterCellContentProps<TData>) => {
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
        <ApplySelect.Root
          items={filterValues}
          selected={filterValue}
          getLabel={(item) => item}
          getValue={(item) => item}
          onApply={handleChange}
          placement="bottom-end"
          {...column.columnDef.meta?.selectProps?.root}
        >
          <ApplySelect.Trigger
            label={name}
            size="sm"
            width="100%"
            variant="plain"
            {...column.columnDef.meta?.selectProps?.trigger}
          />
          <ApplySelect.Content {...column.columnDef.meta?.selectProps?.content}>
            <ApplySelect.Search {...column.columnDef.meta?.selectProps?.search} />
            <ApplySelect.List {...column.columnDef.meta?.selectProps?.list}>
              <ApplySelect.Items>
                {(item: string) => (
                  <ApplySelect.Item
                    key={item}
                    item={item}
                  >
                    <ApplySelect.ItemText />
                    <ApplySelect.ItemIndicator />
                  </ApplySelect.Item>
                )}
              </ApplySelect.Items>
              <ApplySelect.EmptyState />
            </ApplySelect.List>
            <ApplySelect.Actions
              cancelText="Reset"
              {...column.columnDef.meta?.selectProps?.actions}
            />
          </ApplySelect.Content>
        </ApplySelect.Root>
      );
    default:
      return null;
  }
};
