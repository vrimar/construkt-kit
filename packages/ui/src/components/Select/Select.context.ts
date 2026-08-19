import { createContext, type ReactNode, useContext } from "react";

import type {
  SelectionIndicatorPosition,
  SelectionItemState,
  SelectionValue,
} from "../Listbox/types";
import type { SelectionController } from "../Listbox/useSelectionController";
import type { ManagedItemProps } from "./Select.types";

export interface SelectContextValue {
  controller: SelectionController<unknown, SelectionValue>;
  contentWidth?: number;
  matchTriggerWidth: boolean;
  indicatorPosition: SelectionIndicatorPosition;
  placeholder: ReactNode;
  triggerValue: ReactNode;
  hasValue: boolean;
  loading?: boolean;
  emptyMessage?: ReactNode;
  virtual?: boolean;
  scrollToIndexRef: { current: ((index: number) => void) | undefined };
  renderItem?: (item: unknown, state: SelectionItemState<SelectionValue>) => ReactNode;
  renderItemActions?: (item: unknown, state: SelectionItemState<SelectionValue>) => ReactNode;
  getItemProps?: (item: unknown) => ManagedItemProps;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context == null) {
    throw new Error("Select compound components must be used within Select.Root");
  }
  return context;
};
