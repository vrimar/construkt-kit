import { flexRender } from "@tanstack/react-table";

import type { DataTableHeader } from "../types";

export const getColumnLabel = <TData extends object>({ column }: DataTableHeader<TData>) => {
  const { header } = column.columnDef;
  return typeof header === "string" ? header : column.id;
};

export const renderColumnLabel = <TData extends object>(header: DataTableHeader<TData>) => {
  const template = header.column.columnDef.header;
  return template ? flexRender(template, header.getContext()) : null;
};
