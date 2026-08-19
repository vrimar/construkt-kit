import { css as cssFn } from "@construkt-kit/styled-system/css";
import { Box, HStack } from "@construkt-kit/styled-system/jsx";
import type { ReactNode } from "react";

import { SelectButton } from "../Buttons";
import { SearchInput } from "../Input";
import { Listbox, ManagedList } from "../Listbox/Listbox";
import { Popover } from "../Popover";
import { useSelectContext } from "./Select.context";
import type {
  PopoverRootProps,
  SelectContentProps,
  SelectFooterProps,
  SelectItemIndicatorProps,
  SelectListProps,
  SelectSearchProps,
  SelectTriggerProps,
} from "./Select.types";

export const MIN_CONTENT_WIDTH = 140;

interface SelectPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverRootProps["placement"];
  matchTriggerWidth?: boolean;
  contentWidth?: number;
  children: ReactNode;
}

export function SelectPopover({
  open,
  onOpenChange,
  placement,
  matchTriggerWidth = true,
  contentWidth,
  children,
}: SelectPopoverProps) {
  return (
    <Popover.Root
      lazyMount
      open={open}
      onOpenChange={({ open: nextOpen }) => onOpenChange?.(nextOpen)}
      positioning={{ placement, sameWidth: matchTriggerWidth && contentWidth == null }}
    >
      {children}
    </Popover.Root>
  );
}

function SelectPopoverContent({
  contentWidth,
  matchTriggerWidth = true,
  children,
  ...props
}: SelectContentProps & { contentWidth?: number; matchTriggerWidth?: boolean }) {
  return (
    <Popover.Content
      minW={contentWidth == null ? MIN_CONTENT_WIDTH : undefined}
      {...(contentWidth != null
        ? { width: contentWidth }
        : matchTriggerWidth
          ? { width: "full" }
          : {})}
      p="0"
      {...props}
    >
      {children}
    </Popover.Content>
  );
}

export function SelectTrigger({ children, buttonProps, ...triggerProps }: SelectTriggerProps) {
  const { hasValue, triggerValue } = useSelectContext();

  return (
    <Popover.Trigger
      {...triggerProps}
      asChild
    >
      {children ?? (
        <SelectButton
          {...buttonProps}
          hasValue={buttonProps?.hasValue ?? hasValue}
          label={buttonProps?.label ?? triggerValue}
        />
      )}
    </Popover.Trigger>
  );
}

export function SelectContent({ children, ...props }: SelectContentProps) {
  const { contentWidth, matchTriggerWidth } = useSelectContext();
  return (
    <SelectPopoverContent
      contentWidth={contentWidth}
      matchTriggerWidth={matchTriggerWidth}
      {...props}
    >
      {children}
    </SelectPopoverContent>
  );
}

export function SelectSearch({
  children,
  css,
  onChange,
  placeholder,
  size = "sm",
  variant = "plain",
  ...props
}: SelectSearchProps) {
  const { controller } = useSelectContext();
  if (!controller.search.showInput) return null;
  const resolvedPlaceholder = placeholder ?? controller.search.placeholder;

  return (
    <HStack
      gap="0"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <SearchInput
        aria-label={resolvedPlaceholder}
        {...props}
        autoFocus={props.autoFocus ?? controller.search.autoFocus}
        placeholder={resolvedPlaceholder}
        value={controller.search.query}
        onChange={(event) => {
          controller.search.setQuery(event.target.value);
          onChange?.(event);
        }}
        onClear={() => controller.search.setQuery("")}
        size={size}
        css={cssFn.raw({ flex: 1 }, css)}
        variant={variant}
      />
      {children ?? controller.search.endElement}
    </HStack>
  );
}

export function SelectList(props: SelectListProps) {
  const {
    controller,
    emptyMessage,
    getItemProps,
    indicatorPosition,
    loading,
    renderItem,
    renderItemActions,
    scrollToIndexRef,
    virtual,
  } = useSelectContext();

  return (
    <ManagedList
      controller={controller}
      loading={loading}
      emptyMessage={emptyMessage}
      indicatorPosition={indicatorPosition}
      renderItem={renderItem}
      renderItemActions={renderItemActions}
      getItemProps={getItemProps}
      contentProps={props}
      virtual={virtual}
      scrollToIndexRef={scrollToIndexRef}
    />
  );
}

export const SelectItem = Listbox.Item;
export const SelectItemText = Listbox.ItemText;
export const SelectItemActions = Listbox.ItemActions;

export function SelectItemIndicator(props: SelectItemIndicatorProps) {
  const { indicatorPosition } = useSelectContext();
  if (indicatorPosition === "none") return null;
  return <Listbox.ItemIndicator {...props} />;
}

export function SelectEmptyState({ children = "No items available" }: { children?: ReactNode }) {
  const { controller } = useSelectContext();
  if (controller.collection.items.length > 0) return null;
  return <Listbox.EmptyState>{children}</Listbox.EmptyState>;
}

export function SelectFooter({ children, ...props }: SelectFooterProps) {
  return <Box {...props}>{children}</Box>;
}
