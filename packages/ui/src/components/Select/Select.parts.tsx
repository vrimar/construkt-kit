import type { ReactNode } from "react";

import { Box } from "#styled-system/jsx";

import { SelectButton } from "../Buttons";
import { Listbox } from "../Listbox/Listbox";
import { ManagedList, SelectionSearchField } from "../Listbox/managed";
import { Popover } from "../Popover";
import { useSelectContext } from "./Select.context";
import type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemIndicatorProps,
  SelectListProps,
  SelectSearchProps,
  SelectTriggerProps,
} from "./Select.types";

export const MIN_CONTENT_WIDTH = 140;

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
  const { contentWidth, sameWidth } = useSelectContext();

  return (
    <Popover.Content
      layerStyle="dropdown.surface"
      minW={contentWidth == null ? MIN_CONTENT_WIDTH : undefined}
      {...(contentWidth != null ? { width: contentWidth } : sameWidth ? { width: "full" } : {})}
      {...props}
    >
      {children}
    </Popover.Content>
  );
}

export function SelectSearch({ children, placeholder, ...props }: SelectSearchProps) {
  const { controller } = useSelectContext();
  if (!controller.search.showInput) return null;

  return (
    <SelectionSearchField
      {...props}
      autoFocus={props.autoFocus ?? controller.search.autoFocus}
      placeholder={placeholder ?? controller.search.placeholder}
      query={controller.search.query}
      onQueryChange={controller.search.setQuery}
      endElement={children ?? controller.search.endElement}
    />
  );
}

export function SelectList(props: SelectListProps) {
  const { controller, list, scrollToIndexRef } = useSelectContext();

  return (
    <ManagedList
      controller={controller}
      {...list}
      contentProps={props}
      scrollToIndexRef={scrollToIndexRef}
    />
  );
}

export function SelectItemIndicator(props: SelectItemIndicatorProps) {
  const { list } = useSelectContext();
  if (list.indicatorPosition === "none") return null;
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

export const selectListParts = {
  Search: SelectSearch,
  List: SelectList,
  Item: Listbox.Item,
  ItemText: Listbox.ItemText,
  ItemIndicator: SelectItemIndicator,
  ItemActions: Listbox.ItemActions,
  ItemGroup: Listbox.ItemGroup,
  ItemGroupLabel: Listbox.ItemGroupLabel,
  EmptyState: SelectEmptyState,
  Footer: SelectFooter,
};
