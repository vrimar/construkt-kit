import { createContext, useContext } from "react";

import type {
  DataTableLabels,
  DataTableRow,
  DataTableRowProps,
  TableFilterSelections,
} from "./types";

export interface DataTableContextValue<TData extends object = any> {
  loading: boolean;
  getRowInteractionProps: (row: DataTableRow<TData>) => DataTableRowProps;
  onReset?: () => unknown;
  labels: Required<DataTableLabels>;
  selections: TableFilterSelections | undefined;
}

const DataTableContext = createContext<DataTableContextValue | null>(null);

export const DataTableProvider = DataTableContext.Provider;

export function useDataTableContext<TData extends object = any>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) throw new Error("DataTable parts must be rendered inside <DataTable>");
  return context;
}
