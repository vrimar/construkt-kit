import type { BoxProps } from "@construkt-kit/styled-system/jsx";
import type React from "react";
import { createContext, useContext } from "react";

import type { DataTableRow } from "./types";

export interface DataTableContextValue<TData extends object = any> {
  loading: boolean;
  onRowClick?: (e: React.MouseEvent<HTMLDivElement>, row: DataTableRow<TData>) => void;
  onRowKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, row: DataTableRow<TData>) => void;
  getRowProps?: (row: DataTableRow<TData>) => BoxProps;
  onReset?: () => unknown;
  noResultsLabel: string;
  resetFiltersLabel: string;
}

const DataTableContext = createContext<DataTableContextValue | null>(null);

export const DataTableProvider = DataTableContext.Provider;

export function useDataTableContext<TData extends object = any>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) throw new Error("DataTable parts must be rendered inside <DataTable>");
  return context;
}
