import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { HStack } from "#styled-system/jsx";

import { Button } from "../Buttons";
import { encodeSelectionValue, getSelectionLabel, selectItemsByValue } from "../Listbox/managed";
import type { SelectionSearchOptions, SelectionValue } from "../Listbox/types";
import { Select } from "./Select";
import {
  type SelectRootOverrides,
  SelectRootOverridesContext,
  useSelectContext,
} from "./Select.context";
import { SelectSimpleBody, selectListParts } from "./Select.parts";
import type {
  SelectContentProps,
  SelectListProps,
  SelectMultipleValueProps,
  SelectRootBaseProps,
  SelectSearchProps,
  SelectSimpleProps,
  SelectTriggerProps,
} from "./Select.types";

interface ApplySelectContextValue {
  allSelected: boolean;
  apply: () => void;
  reset: () => void;
  toggleAll: () => void;
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

export type ApplySelectActionsProps = ApplySelectActionOptions;

export type ApplySelectTriggerProps = SelectTriggerProps;
export type ApplySelectContentProps = SelectContentProps;
export type ApplySelectSearchProps = SelectSearchProps;
export type ApplySelectListProps = SelectListProps;

export interface ApplySelectRootProps<T, V extends SelectionValue = SelectionValue>
  extends SelectRootBaseProps<T, V>, SelectMultipleValueProps<V> {}

export function ApplySelectActions({
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  reset = false,
  resetLabel = "Reset",
  toggleAll = false,
  selectAllLabel = "Select All",
  clearAllLabel = "Clear All",
}: ApplySelectActionsProps) {
  const {
    allSelected,
    apply,
    reset: handleReset,
    toggleAll: handleToggleAll,
    isDirty,
  } = useApplySelectContext();
  const { close } = useSelectContext();

  return (
    <Select.Footer>
      <HStack p="4">
        {toggleAll && (
          <Button
            size="xs"
            variant="outline"
            onClick={handleToggleAll}
          >
            {allSelected ? clearAllLabel : selectAllLabel}
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

export function ApplySelectRoot<T, V extends SelectionValue>({
  children,
  getItemLabel,
  getItemValue,
  items,
  onOpenChange,
  onValueChange,
  open,
  placeholder = "Select",
  renderValue,
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

  const itemValues = useMemo(() => items.map(getItemValue), [getItemValue, items]);
  const draftSet = useMemo(() => new Set(draft.map(encodeSelectionValue)), [draft]);
  const allSelected =
    itemValues.length > 0 &&
    itemValues.every((itemValue) => draftSet.has(encodeSelectionValue(itemValue)));
  const toggleAll = useCallback(
    () => setDraft(allSelected ? [] : [...itemValues]),
    [allSelected, itemValues],
  );
  const isDirty = !sameValueSet(value, draft);
  const selectedItems = useMemo(
    () => selectItemsByValue(items, value, getItemValue),
    [getItemValue, items, value],
  );
  const triggerValue = renderValue
    ? renderValue({ value, selectedItems })
    : getSelectionLabel(value.length, selectedItems, getItemLabel, placeholder);
  const resolvedSearch: boolean | SelectionSearchOptions<T> =
    search === false ? false : { autoFocus: true, ...(typeof search === "object" ? search : {}) };

  const contextValue = useMemo<ApplySelectContextValue>(
    () => ({ allSelected, apply, reset, toggleAll, isDirty }),
    [allSelected, apply, isDirty, reset, toggleAll],
  );
  const overrides = useMemo<SelectRootOverrides>(
    () => ({ triggerValue, hasValue: value.length > 0, wideContent: true }),
    [triggerValue, value.length],
  );

  return (
    <ApplySelectContext.Provider value={contextValue}>
      <SelectRootOverridesContext.Provider value={overrides}>
        <Select.Root
          {...rootProps}
          items={items}
          getItemValue={getItemValue}
          getItemLabel={getItemLabel}
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
