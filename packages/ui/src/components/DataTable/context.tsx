import { type RefObject } from "react";

import { createPartContext } from "../partContext";
import type { ResolvedLabels } from "./labels";
import type {
  DataTableColumnSizing,
  DataTableRow,
  DataTableRowProps,
  TableFilterSelections,
} from "./types";

export interface DataTableContextValue<TData extends object = any> {
  loading: boolean;
  getRowInteractionProps: (row: DataTableRow<TData>) => DataTableRowProps;
  onReset?: () => unknown;
  labels: ResolvedLabels;
  selections: TableFilterSelections | undefined;
  clientSide: boolean;
  columnSizing: DataTableColumnSizing;
  resizeColumn?: (columnId: string, width: number | undefined) => void;
  gridRef: RefObject<HTMLDivElement | null>;
}

const [DataTableContext, useDataTablePart] = createPartContext<DataTableContextValue>(
  "<DataTable>",
  "DataTable parts",
);

export const DataTableProvider = DataTableContext.Provider;

export function useDataTableContext<TData extends object = any>(): DataTableContextValue<TData> {
  return useDataTablePart();
}
