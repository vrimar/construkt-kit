import { createContext, useContext } from "react";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarState {
  orientation: ToolbarOrientation;
  collapsed: boolean;
}

export const ToolbarContext = createContext<ToolbarState | null>(null);

export const useToolbarContext = () => useContext(ToolbarContext);
