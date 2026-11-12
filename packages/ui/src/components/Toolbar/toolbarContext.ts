import { type KeyboardEvent, createContext, useContext } from "react";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarState {
  orientation: ToolbarOrientation;
  collapsed: boolean;
  navigate: (event: KeyboardEvent<HTMLElement>) => void;
}

export const ToolbarContext = createContext<ToolbarState | null>(null);

export const useToolbarContext = () => useContext(ToolbarContext);
