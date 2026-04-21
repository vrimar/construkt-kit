import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HStack } from "styled-system/jsx";

import { Button } from "../Buttons";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectSearchProps,
  SelectTriggerProps,
  SelectValue,
} from "../Select";
import { Select } from "../Select";

interface ApplySelectContextValue {
  allSelected: boolean;
  handleApply: () => void;
  handleReset: () => void;
  handleToggleAll: () => void;
  hasSelection: boolean;
}

const ApplySelectContext = createContext<ApplySelectContextValue | null>(null);

const useApplySelectContext = () => {
  const context = useContext(ApplySelectContext);

  if (context == null) {
    throw new Error("ApplySelect compound components must be used within ApplySelect.Root");
  }

  return context;
};

export interface ApplySelectRootProps<T> extends Omit<
  SelectRootProps<T>,
  "children" | "onSelect" | "selected"
> {
  onApply: (values: T[]) => unknown;
  children: React.ReactNode;
  selected: SelectValue[];
}

export interface ApplySelectActionsProps {
  applyText?: string;
  cancelText?: string;
  hasToggleAll?: boolean;
  onReset?: () => void;
}

export type ApplySelectTriggerProps = SelectTriggerProps;
export type ApplySelectContentProps = SelectContentProps;
export type ApplySelectSearchProps = SelectSearchProps;
export type ApplySelectListProps = SelectListProps;

export const ApplySelectRoot = <T,>({
  children,
  onApply,
  selected,
  ...props
}: ApplySelectRootProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<SelectValue[]>([]);

  const { getValue, items, onOpenChange, open } = props;

  useEffect(() => {
    setTempSelected(Array.isArray(selected) ? selected : []);
  }, [selected]);

  const allSelected = items.length > 0 && tempSelected.length === items.length;

  const handleSelect = (item: T) => {
    const value = getValue(item);
    setTempSelected((prev) => {
      const exists = prev.includes(value);
      if (exists) return prev.filter((i) => i !== value);
      return [...prev, value];
    });
  };

  const handleApply = useCallback(() => {
    onApply(
      tempSelected.map((id) => items.find((item) => getValue(item) === id)).filter(Boolean) as T[],
    );
    setIsOpen(false);
  }, [getValue, items, onApply, tempSelected]);

  const handleReset = useCallback(() => {
    setTempSelected(Array.isArray(selected) ? selected : []);
    setIsOpen(false);
  }, [selected]);

  const handleSelectOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);

    const hasSelected = !nextOpen && Array.isArray(selected);

    if (!nextOpen) setTempSelected(hasSelected ? selected : []);
  };

  const handleToggleAll = useCallback(() => {
    setTempSelected(allSelected ? [] : items.map(getValue));
  }, [allSelected, getValue, items]);

  const contextValue = useMemo<ApplySelectContextValue>(
    () => ({
      allSelected,
      handleApply,
      handleReset,
      handleToggleAll,
      hasSelection: tempSelected.length > 0,
    }),
    [allSelected, handleApply, handleReset, handleToggleAll, tempSelected.length],
  );

  return (
    <ApplySelectContext.Provider value={contextValue}>
      <Select.Root
        {...props}
        onOpenChange={handleSelectOpenChange}
        onSelect={handleSelect}
        open={open ?? isOpen}
        selected={tempSelected}
      >
        {children}
      </Select.Root>
    </ApplySelectContext.Provider>
  );
};

export const ApplySelectActions = ({
  applyText = "Apply",
  cancelText = "Cancel",
  hasToggleAll = false,
  onReset,
}: ApplySelectActionsProps) => {
  const { allSelected, handleApply, handleReset, handleToggleAll, hasSelection } =
    useApplySelectContext();

  const handleResetClick = () => {
    onReset?.();
    handleReset();
  };

  return (
    <Select.Footer>
      <HStack p="4">
        {hasToggleAll && (
          <HStack>
            <Button
              size="xs"
              variant="outline"
              onClick={handleToggleAll}
            >
              {allSelected ? "Clear All" : "Toggle All"}
            </Button>
          </HStack>
        )}
        <HStack
          justifyContent="flex-end"
          width="100%"
        >
          <Button
            variant="plain"
            onClick={handleResetClick}
            size="xs"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleApply}
            size="xs"
            disabled={!hasSelection}
          >
            {applyText}
          </Button>
        </HStack>
      </HStack>
    </Select.Footer>
  );
};

export const ApplySelect = {
  Root: ApplySelectRoot,
  Trigger: Select.Trigger,
  Content: Select.Content,
  Search: Select.Search,
  List: Select.List,
  Items: Select.Items,
  Item: Select.Item,
  ItemText: Select.ItemText,
  ItemIndicator: Select.ItemIndicator,
  EmptyState: Select.EmptyState,
  Footer: Select.Footer,
  Actions: ApplySelectActions,
};
