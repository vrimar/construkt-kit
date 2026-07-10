import { HStack } from "@construkt-kit/styled-system/jsx";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "../Buttons";
import type {
  SelectionSearchOptions,
  SelectionValue,
  SelectionValueRenderContext,
} from "../Listbox";
import { encodeSelectionValue } from "../Listbox/useSelectionController";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectSearchProps,
  SelectTriggerProps,
} from "../Select";
import { Select } from "../Select";

interface ApplySelectContextValue {
  allSelected: boolean;
  apply: () => void;
  cancel: () => void;
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

function resolveSelectedItems<T, V extends SelectionValue>(
  items: readonly T[],
  value: readonly V[],
  getItemValue: (item: T) => V,
) {
  const selected = new Set(value.map(encodeSelectionValue));
  return items.filter((item) => selected.has(encodeSelectionValue(getItemValue(item))));
}

function getDefaultAppliedLabel<T, V extends SelectionValue>(
  items: readonly T[],
  value: readonly V[],
  getItemValue: (item: T) => V,
  getItemLabel: (item: T) => string,
  placeholder: ReactNode,
) {
  if (value.length === 0) return placeholder;
  if (value.length > 1) return `${value.length} selected`;
  const item = resolveSelectedItems(items, value, getItemValue)[0];
  return item == null ? "1 selected" : getItemLabel(item);
}

export interface ApplySelectActionOptions {
  applyLabel?: ReactNode;
  cancelLabel?: ReactNode;
  toggleAll?: boolean;
  selectAllLabel?: ReactNode;
  clearAllLabel?: ReactNode;
}

export interface ApplySelectActionsProps extends ApplySelectActionOptions {}

export type ApplySelectTriggerProps = SelectTriggerProps;
export type ApplySelectContentProps = SelectContentProps;
export type ApplySelectSearchProps = SelectSearchProps;
export type ApplySelectListProps = SelectListProps;

type ApplyRootBaseProps<T, V extends SelectionValue> = Omit<
  SelectRootProps<T, V>,
  "defaultOpen" | "onOpenChange" | "onValueChange" | "open" | "selectionMode" | "value"
>;

export interface ApplySelectRootProps<
  T,
  V extends SelectionValue = SelectionValue,
> extends ApplyRootBaseProps<T, V> {
  value: readonly V[];
  onValueChange: (value: V[]) => unknown;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => unknown;
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
  toggleAll = false,
  selectAllLabel = "Select All",
  clearAllLabel = "Clear All",
}: ApplySelectActionsProps) {
  const {
    allSelected,
    apply,
    cancel,
    toggleAll: handleToggleAll,
    isDirty,
  } = useApplySelectContext();

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
            onClick={cancel}
            size="xs"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={apply}
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
  defaultOpen = false,
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
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<V[]>([...value]);
  const resolvedOpen = open ?? internalOpen;

  useEffect(() => {
    if (!resolvedOpen) {
      setDraft((current) => (sameValueSet(current, value) ? current : [...value]));
    }
  }, [resolvedOpen, value]);

  const close = useCallback(() => {
    if (open == null) setInternalOpen(false);
    setDraft([...value]);
    onOpenChange?.(false);
  }, [onOpenChange, open, value]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (open == null) setInternalOpen(nextOpen);
    if (!nextOpen) setDraft([...value]);
    onOpenChange?.(nextOpen);
  };

  const apply = useCallback(() => {
    onValueChange([...draft]);
    close();
  }, [close, draft, onValueChange]);

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
    () => resolveSelectedItems(items, value, getItemValue),
    [getItemValue, items, value],
  );
  const triggerValue = renderValue
    ? renderValue({ value, selectedItems } as SelectionValueRenderContext<T, V>)
    : getDefaultAppliedLabel(items, value, getItemValue, getItemLabel, placeholder);

  const contextValue = useMemo<ApplySelectContextValue>(
    () => ({
      allSelected,
      apply,
      cancel: close,
      toggleAll,
      hasAppliedValue: value.length > 0,
      isDirty,
      triggerValue,
    }),
    [allSelected, apply, close, isDirty, toggleAll, triggerValue, value.length],
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
        open={resolvedOpen}
        onOpenChange={handleOpenChange}
      >
        {children}
      </Select.Root>
    </ApplySelectContext.Provider>
  );
}

interface ApplySelectSimpleProps<T, V extends SelectionValue> extends Omit<
  ApplySelectRootProps<T, V>,
  "children"
> {
  triggerProps?: ApplySelectTriggerProps;
  contentProps?: ApplySelectContentProps;
  listProps?: ApplySelectListProps;
  actions?: ApplySelectActionOptions;
  footer?: ReactNode;
}

export type ApplySelectProps<T, V extends SelectionValue = SelectionValue> = ApplySelectSimpleProps<
  T,
  V
>;

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
        {resolvedSearch !== false && <Select.Search />}
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
  Search: Select.Search,
  List: Select.List,
  Item: Select.Item,
  ItemText: Select.ItemText,
  ItemIndicator: Select.ItemIndicator,
  ItemActions: Select.ItemActions,
  EmptyState: Select.EmptyState,
  Footer: Select.Footer,
  Actions: ApplySelectActions,
});
