import { createContext, type ReactNode, useContext } from "react";

import type { SelectionController } from "../Listbox/managed";
import type { ManagedListOptions, SelectionValue } from "../Listbox/types";

export interface SelectContextValue {
  controller: SelectionController<unknown, SelectionValue>;
  list: ManagedListOptions<unknown, SelectionValue>;
  contentWidth?: string | number;
  sameWidth: boolean;
  wideContent: boolean;
  triggerValue: ReactNode;
  hasValue: boolean;
  scrollToIndexRef: { current: ((index: number) => void) | undefined };
  close: () => void;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export type SelectRootOverrides = Pick<
  SelectContextValue,
  "triggerValue" | "hasValue" | "wideContent"
>;

export const SelectRootOverridesContext = createContext<SelectRootOverrides | null>(null);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context == null) {
    throw new Error("Select compound components must be used within Select.Root");
  }
  return context;
};
