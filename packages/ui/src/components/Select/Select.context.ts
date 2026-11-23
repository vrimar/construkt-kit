import { type ReactNode } from "react";

import type { ManagedListOptions, ManagedListbox } from "../Listbox/managed";
import { createPartContext } from "../partContext";
import type { SelectionValue } from "../selection";

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

export const [SelectContext, useSelectContext] = createPartContext<SelectContextValue>(
  "<Select.Root>",
  "Select parts",
);
