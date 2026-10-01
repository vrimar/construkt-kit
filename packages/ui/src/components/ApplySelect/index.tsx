import { HStack } from "@construkt-kit/styled-system/jsx";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { Button } from "../Buttons";
import type { SelectionSearchOptions, SelectionValue } from "../Listbox";
import { encodeSelectionValue, getSelectionLabel, selectItemsByValue } from "../Listbox/managed";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectSearchProps,
  SelectTriggerProps,
} from "../Select";
import { Select } from "../Select";
import { useSelectContext } from "../Select/Select.context";
import { selectListParts } from "../Select/Select.parts";

interface ApplySelectContextValue {
  allSelected: boolean;
  apply: () => void;
  reset: () => void;
  toggleAll: () => void;
  hasAppliedValue: boolean;
  isDirty: boolean;
  triggerValue: ReactNode;
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

export interface ApplySelectRootProps<T, V extends SelectionValue = SelectionValue> extends Omit<
  SelectRootProps<T, V>,
  "onValueChange" | "selectionMode" | "value"
> {
  value: readonly V[];
  onValueChange: (value: V[]) => unknown;
}

const APPLY_CONTENT_MIN_WIDTH = 256;

export function ApplySelectContent({ children, ...props }: ApplySelectContentProps) {
  return (
    <Select.Content
      minW={APPLY_CONTENT_MIN_WIDTH}
      {...props}
    >
      {children}
    </Select.Content>
  );
}

export function ApplySelectTrigger({ buttonProps, ...props }: ApplySelectTriggerProps) {
  const { hasAppliedValue, triggerValue } = useApplySelectContext();
  return (
    <Select.Trigger
      {...props}
      buttonProps={{
        ...buttonProps,
        hasValue: buttonProps?.hasValue ?? hasAppliedValue,
        label: buttonProps?.label ?? triggerValue,
      }}
    />
  );
}

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
  search = true,
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

  const contextValue = useMemo<ApplySelectContextValue>(
    () => ({
      allSelected,
      apply,
      reset,
      toggleAll,
      hasAppliedValue: value.length > 0,
      isDirty,
      triggerValue,
    }),
    [allSelected, apply, isDirty, reset, toggleAll, triggerValue, value.length],
  );

  return (
    <ApplySelectContext.Provider value={contextValue}>
      <Select.Root
        {...rootProps}
        items={items}
        getItemValue={getItemValue}
        getItemLabel={getItemLabel}
        placeholder={placeholder}
        value={draft}
        onValueChange={setDraft}
        selectionMode="multiple"
        search={search}
        open={open}
        onOpenChange={handleOpenChange}
      >
        {children}
      </Select.Root>
    </ApplySelectContext.Provider>
  );
}

export interface ApplySelectProps<T, V extends SelectionValue = SelectionValue> extends Omit<
  ApplySelectRootProps<T, V>,
  "children"
> {
  triggerProps?: ApplySelectTriggerProps;
  contentProps?: ApplySelectContentProps;
  listProps?: ApplySelectListProps;
  actions?: ApplySelectActionOptions;
  footer?: ReactNode;
}

function ApplySelectSimple<T, V extends SelectionValue>({
  actions,
  contentProps,
  footer,
  listProps,
  search,
  triggerProps,
  ...rootProps
}: ApplySelectProps<T, V>) {
  const resolvedSearch: boolean | SelectionSearchOptions<T> =
    search === false
      ? false
      : typeof search === "object"
        ? { autoFocus: true, ...search }
        : { autoFocus: true };

  return (
    <ApplySelectRoot
      {...rootProps}
      search={resolvedSearch}
    >
      <ApplySelectTrigger {...triggerProps} />
      <ApplySelectContent {...contentProps}>
        <Select.Search />
        <Select.List {...listProps} />
        {footer}
        <ApplySelectActions {...actions} />
      </ApplySelectContent>
    </ApplySelectRoot>
  );
}

export const ApplySelect = Object.assign(ApplySelectSimple, {
  Root: ApplySelectRoot,
  Trigger: ApplySelectTrigger,
  Content: ApplySelectContent,
  ...selectListParts,
  Actions: ApplySelectActions,
});
