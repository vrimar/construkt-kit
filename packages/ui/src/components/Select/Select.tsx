import type { BoxProps } from "@chakra-ui/react";
import React, { useMemo, useRef } from "react";

import type { SelectButtonProps } from "../Buttons";
import { SelectButton } from "../Buttons";
import { Popover } from "../Popover";

type PopoverContentProps = React.ComponentProps<typeof Popover.Content>;
type PopoverRootProps = React.ComponentProps<typeof Popover.Root>;
import type { SelectListProps, SelectValue } from "./SelectList";
import { SelectList } from "./SelectList";

export interface SelectProps<T, V extends SelectValue> extends SelectListProps<T, V> {
  triggerProps?: Partial<SelectButtonProps>;
  emptySelectionLabel?: string;
  getTriggerLabel?: (label: string) => string;
  contentProps?: Partial<PopoverContentProps>;
  contentWidth?: number;
  listContentProps?: BoxProps;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (value: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
}

const minContentWidth = 140;

export const Select = <T, V extends SelectValue>({
  open,
  onOpenChange,
  triggerProps,
  emptySelectionLabel,
  getTriggerLabel,
  contentProps,
  contentWidth: controlledContentWidth,
  listContentProps,
  trigger,
  footer,
  onSelect,
  placement,
  ...props
}: SelectProps<T, V>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { selected, items, getValue, getLabel } = props;
  const isMultiSelect = Array.isArray(selected);
  const buttonRef = useRef<HTMLButtonElement>(null);
  let contentWidth = controlledContentWidth ?? buttonRef.current?.clientWidth;

  if (contentWidth == null || contentWidth < minContentWidth) contentWidth = minContentWidth;

  const selectedItems = useMemo(
    () => (selected == null ? [] : Array.isArray(selected) ? selected : [selected]),
    [selected],
  );

  const hasSelected = useMemo(() => selectedItems.length > 0, [selectedItems]);

  const label = useMemo(() => {
    if (selectedItems.length === 1) {
      const item = items.find((i) => getValue(i) === selectedItems[0]);
      return item ? getLabel(item) : "";
    }

    return emptySelectionLabel || `${selectedItems.length} Active`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedItems]);

  const controlledOpen = open != null ? open : isOpen;

  const handleOpenChange = (value: boolean) => {
    if (open != null) {
      if (onOpenChange != null) onOpenChange(value);
    } else setIsOpen(value);
  };

  const handleSelect = (item: T) => {
    onSelect(item);

    if (!isMultiSelect) handleOpenChange(false);
  };

  return (
    <Popover.Root
      lazyMount
      open={controlledOpen}
      onOpenChange={({ open }) => handleOpenChange(open)}
      positioning={{ placement }}
    >
      <Popover.Trigger asChild>
        {trigger || (
          <SelectButton
            ref={buttonRef}
            {...triggerProps}
            hasValue={hasSelected}
            label={getTriggerLabel ? getTriggerLabel(label) : label}
            sublabel={triggerProps?.sublabel}
          />
        )}
      </Popover.Trigger>

      <Popover.Content
        width={contentWidth}
        p="0"
        {...contentProps}
      >
        <SelectList
          {...props}
          contentProps={listContentProps}
          onSelect={handleSelect}
        />
        {footer}
      </Popover.Content>
    </Popover.Root>
  );
};
