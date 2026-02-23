import { Button, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import type { SelectProps, SelectValue } from "../Select";
import { Select } from "../Select";

export interface ApplySelectProps<T, V extends SelectValue> extends Omit<
  SelectProps<T, V>,
  "onSelect"
> {
  onApply: (values: T[]) => unknown;
  applyText?: string;
  cancelText?: string;
  hasToggleAll?: boolean;
}

export const ApplySelect = <T, V extends SelectValue>({
  onApply,
  selected,
  applyText = "Apply",
  cancelText = "Cancel",
  triggerProps,
  footer,
  hasToggleAll,
  ...props
}: ApplySelectProps<T, V>) => {
  const [isAllToggled, setIsAllToggled] = useState(false);
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<V[]>([]);

  useEffect(() => {
    setTempSelected(Array.isArray(selected) ? selected : []);
  }, [selected]);

  const getValue = props.getValue;

  const handleSelect = (item: T) => {
    const value = getValue(item);
    setTempSelected((prev) => {
      const exists = prev.includes(value);
      if (exists) return prev.filter((i) => i !== value);
      return [...prev, value];
    });
  };

  const handleApply = () => {
    onApply(tempSelected.map((id) => props.items.find((i) => getValue(i) === id)) as T[]);
    setOpen(false);
  };

  const handleReset = () => {
    setTempSelected(Array.isArray(selected) ? selected : []);
    setOpen(false);
    onApply([]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    const hasSelected = !isOpen && Array.isArray(selected);

    if (!isOpen) setTempSelected(hasSelected ? selected : []);
  };

  const handleToggleAll = () => {
    if (isAllToggled) setTempSelected([]);
    else {
      const filteredItems = props.items.filter((item) => {
        const label = props.getLabel(item).toLowerCase();
        const lowercaseQuery = props.searchQuery?.toLowerCase() ?? "";

        return props.searchFilter
          ? props.searchFilter(item, lowercaseQuery)
          : label.includes(lowercaseQuery);
      });

      setTempSelected(filteredItems.map(getValue));
    }

    setIsAllToggled(!isAllToggled);
  };

  return (
    <Select
      {...props}
      footer={
        <HStack p="4">
          {hasToggleAll && (
            <HStack>
              <Button
                size="xs"
                variant="outline"
                onClick={handleToggleAll}
              >
                Toggle All
              </Button>
            </HStack>
          )}
          <HStack
            justifyContent="flex-end"
            width="100%"
          >
            <Button
              variant="ghost"
              onClick={handleReset}
              size="xs"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleApply}
              size="xs"
              disabled={tempSelected.length === 0}
            >
              {applyText}
            </Button>
          </HStack>
        </HStack>
      }
      open={open}
      onOpenChange={handleOpenChange}
      selected={tempSelected}
      onSelect={handleSelect}
      triggerProps={triggerProps}
    />
  );
};
