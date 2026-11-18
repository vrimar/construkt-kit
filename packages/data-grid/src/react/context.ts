import { createContext, useContext } from "react";

import type { AnyGridCore } from "./useGridCore";

export const GridCoreContext = createContext<AnyGridCore | null>(null);

export const RowStateVersionContext = createContext(0);

export function useGridCoreContext(): AnyGridCore {
  const core = useContext(GridCoreContext);
  if (!core) throw new Error("DataGrid: this component renders only inside a DataGrid");
  return core;
}

export function useRowStateCore(): AnyGridCore {
  // Re-renders past memoized cells and headers when row selection state changes.
  useContext(RowStateVersionContext);
  return useGridCoreContext();
}
