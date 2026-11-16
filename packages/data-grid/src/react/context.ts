import { createContext, useContext } from "react";

import type { AnyGridCore } from "./useGridCore";

export const GridCoreContext = createContext<AnyGridCore | null>(null);

export function useGridCoreContext(): AnyGridCore {
  const core = useContext(GridCoreContext);
  if (!core) throw new Error("DataGrid: this component renders only inside a DataGrid");
  return core;
}
