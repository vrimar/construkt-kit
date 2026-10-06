import type { ReactNode } from "react";

import { Box } from "#styled-system/jsx";

import { toCssSize } from "../../foundations/cssSize";
import { SelectButton } from "../Buttons";
import { Listbox } from "../Listbox/Listbox";
import { ManagedList, SelectionSearchField } from "../Listbox/managed";
import type { SelectionValue } from "../Listbox/types";
import { Popover } from "../Popover";
import { useSelectContext } from "./Select.context";
import type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemIndicatorProps,
  SelectListProps,
  SelectSearchProps,
  SelectSimpleProps,
  SelectTriggerProps,
} from "./Select.types";

const MIN_CONTENT_WIDTH = 140;
const WIDE_MIN_CONTENT_WIDTH = 256;

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

export function SelectContent({ children, style, ...props }: SelectContentProps) {
  const { contentWidth, sameWidth, wideContent } = useSelectContext();
  const minContentWidth = wideContent ? WIDE_MIN_CONTENT_WIDTH : MIN_CONTENT_WIDTH;

  return (
    <Popover.Content
      layerStyle="dropdown.surface"
      minW={contentWidth == null ? minContentWidth : undefined}
      width={sameWidth ? "full" : undefined}
      style={contentWidth == null ? style : { width: toCssSize(contentWidth), ...style }}
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

type SelectSimpleBodyProps = Pick<
  SelectSimpleProps<unknown, SelectionValue>,
  "contentCss" | "footer" | "listCss" | "triggerProps"
> & { children?: ReactNode };

export function SelectSimpleBody({
  triggerProps,
  contentCss,
  listCss,
  footer,
  children,
}: SelectSimpleBodyProps) {
  return (
    <>
      <SelectTrigger {...triggerProps} />
      <SelectContent css={contentCss}>
        <SelectSearch />
        <SelectList css={listCss} />
        {footer != null && <SelectFooter>{footer}</SelectFooter>}
        {children}
      </SelectContent>
    </>
  );
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
