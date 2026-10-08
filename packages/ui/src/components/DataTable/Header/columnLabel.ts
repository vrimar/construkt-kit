import type { DataTableHeader } from "../types";

export const getColumnLabel = <TData extends object>({ column }: DataTableHeader<TData>) => {
  const { header } = column.columnDef;
  return typeof header === "string" ? header : column.id;
};
