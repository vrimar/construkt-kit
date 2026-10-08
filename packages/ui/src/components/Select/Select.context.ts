import { createContext, type ReactNode, useContext } from "react";

import type { ManagedListbox } from "../Listbox/managed";
import type { ManagedListOptions, SelectionValue } from "../Listbox/types";

export interface SelectContextValue {
  managed: ManagedListbox<unknown, SelectionValue>;
  list: ManagedListOptions<unknown, SelectionValue>;
  contentWidth?: string | number;
  sameWidth: boolean;
  wideContent: boolean;
  triggerValue: ReactNode;
  hasValue: boolean;
  close: () => void;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export interface SelectRootOverrides<V extends SelectionValue = SelectionValue> {
  appliedValue: readonly V[];
  wideContent: boolean;
}

export const SelectRootOverridesContext = createContext<SelectRootOverrides | null>(null);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context == null) {
    throw new Error("Select compound components must be used within Select.Root");
  }
  return context;
};
