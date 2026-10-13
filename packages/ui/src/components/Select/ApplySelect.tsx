import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { HStack } from "#styled-system/jsx";

import { Button } from "../Buttons";
import { encodeSelectionValue } from "../Listbox/managed";
import type { SelectionSearchOptions, SelectionValue } from "../Listbox/types";
import { Select } from "./Select";
import {
  type SelectRootOverrides,
  SelectRootOverridesContext,
  useSelectContext,
} from "./Select.context";
import { SelectSimpleBody, selectListParts } from "./Select.parts";
import type {
  SelectMultipleValueProps,
  SelectRootBaseProps,
  SelectSimpleProps,
} from "./Select.types";

interface ApplySelectContextValue {
  apply: () => void;
  reset: () => void;
  isDirty: boolean;
}

const ApplySelectContext = createContext<ApplySelectContextValue | null>(null);

const useApplySelectContext = () => {
  const context = useContext(ApplySelectContext);
  if (context == null) {
    throw new Error("ApplySelect compound components must be used within ApplySelect.Root");
  }
  return context;
};

function sameValueSet<V extends SelectionValue>(left: readonly V[], right: readonly V[]) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right.map(encodeSelectionValue));
  return left.every((value) => rightSet.has(encodeSelectionValue(value)));
}

export interface ApplySelectActionOptions {
  applyLabel?: ReactNode;
  cancelLabel?: ReactNode;
  reset?: boolean;
  resetLabel?: ReactNode;
  toggleAll?: boolean;
  selectAllLabel?: ReactNode;
  clearAllLabel?: ReactNode;
}

export interface ApplySelectRootProps<T, V extends SelectionValue = SelectionValue>
  extends SelectRootBaseProps<T, V>, SelectMultipleValueProps<V> {}

function ApplySelectActions({
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  reset = false,
  resetLabel = "Reset",
  toggleAll = false,
  selectAllLabel = "Select all",
  clearAllLabel = "Deselect all",
}: ApplySelectActionOptions) {
  const { apply, reset: handleReset, isDirty } = useApplySelectContext();
  const { close, managed } = useSelectContext();
  const { getSelectAllState, handleValueChange } = managed.controller;
  const selectAll = useMemo(() => getSelectAllState(), [getSelectAllState]);

  return (
    <Select.Footer>
      <HStack p="4">
        {toggleAll && (
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleValueChange({ value: selectAll.toggle() })}
          >
            {selectAll.allSelected ? clearAllLabel : selectAllLabel}
          </Button>
        )}
        <HStack
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            variant="plain"
            onClick={
              reset
                ? () => {
                    handleReset();
                    close();
                  }
                : close
            }
            size="xs"
          >
            {reset ? resetLabel : cancelLabel}
          </Button>
          <Button
            onClick={() => {
              apply();
              close();
            }}
            size="xs"
            disabled={!isDirty}
          >
            {applyLabel}
          </Button>
        </HStack>
      </HStack>
    </Select.Footer>
  );
}

function ApplySelectRoot<T, V extends SelectionValue>({
  children,
  onOpenChange,
  onValueChange,
  open,
  search,
  value,
  ...rootProps
}: ApplySelectRootProps<T, V>) {
  const [draft, setDraft] = useState<V[]>([...value]);
  const [synced, setSynced] = useState({ open, value });

  if (synced.open !== open || synced.value !== value) {
    setSynced({ open, value });
    if (open === false || !sameValueSet(synced.value, value)) setDraft([...value]);
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setDraft([...value]);
    onOpenChange?.(nextOpen);
  };

  const apply = useCallback(() => onValueChange([...draft]), [draft, onValueChange]);
  const reset = useCallback(() => onValueChange([]), [onValueChange]);

  const isDirty = !sameValueSet(value, draft);
  const resolvedSearch: boolean | SelectionSearchOptions<T> =
    search === false ? false : { autoFocus: true, ...(typeof search === "object" ? search : {}) };

  const contextValue = useMemo<ApplySelectContextValue>(
    () => ({ apply, reset, isDirty }),
    [apply, isDirty, reset],
  );
  const overrides = useMemo<SelectRootOverrides<V>>(
    () => ({ appliedValue: value, wideContent: true }),
    [value],
  );

  return (
    <ApplySelectContext.Provider value={contextValue}>
      <SelectRootOverridesContext.Provider value={overrides}>
        <Select.Root
          {...rootProps}
          value={draft}
          onValueChange={setDraft}
          selectionMode="multiple"
          search={resolvedSearch}
          open={open}
          onOpenChange={handleOpenChange}
        >
          {children}
        </Select.Root>
      </SelectRootOverridesContext.Provider>
    </ApplySelectContext.Provider>
  );
}

export interface ApplySelectProps<T, V extends SelectionValue = SelectionValue>
  extends SelectSimpleProps<T, V>, SelectMultipleValueProps<V> {
  actions?: ApplySelectActionOptions;
}

function ApplySelectSimple<T, V extends SelectionValue>({
  actions,
  contentCss,
  footer,
  listCss,
  triggerProps,
  ...rootProps
}: ApplySelectProps<T, V>) {
  return (
    <ApplySelectRoot {...rootProps}>
      <SelectSimpleBody
        triggerProps={triggerProps}
        contentCss={contentCss}
        listCss={listCss}
        footer={footer}
      >
        <ApplySelectActions {...actions} />
      </SelectSimpleBody>
    </ApplySelectRoot>
  );
}

export const ApplySelect = Object.assign(ApplySelectSimple, {
  Root: ApplySelectRoot,
  Trigger: Select.Trigger,
  Content: Select.Content,
  ...selectListParts,
  Actions: ApplySelectActions,
});
