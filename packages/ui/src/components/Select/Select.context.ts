import { createContext, type ReactNode, useContext } from "react";

import type { ManagedListbox } from "../Listbox/managed";
import type { ManagedListOptions, SelectionValue } from "../Listbox/types";

export interface SelectContextValue {
  managed: ManagedListbox<unknown, SelectionValue>;
  list: ManagedListOptions<unknown, SelectionValue>;
  contentWidth?: string | number;
  sameWidth: boolean;
  wideContent: boolean;
  appliedItems: readonly unknown[];
  triggerValue: ReactNode;
  hasValue: boolean;
  close: (event?: Event) => void;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context == null) {
    throw new Error("Select compound components must be used within Select.Root");
  }
  return context;
};
