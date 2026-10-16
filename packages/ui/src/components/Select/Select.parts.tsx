import { usePopoverContext } from "@ark-ui/react/popover";
import type { KeyboardEvent, ReactNode } from "react";

import { Box } from "#styled-system/jsx";

import { toCssSize } from "../../foundations/cssSize";
import { SelectButton } from "../Buttons";
import { Listbox } from "../Listbox/Listbox";
import { ListboxSearchField, ManagedList } from "../Listbox/managed";
import type { SelectionValue } from "../Listbox/types";
import { useOverlayMode } from "../overlayPresentation";
import { Popover } from "../Popover";
import { useSelectContext } from "./Select.context";
import type {
  SelectContentProps,
  SelectListProps,
  SelectSearchProps,
  SelectSimpleProps,
  SelectTriggerProps,
} from "./Select.types";

const MIN_CONTENT_WIDTH = 140;
const WIDE_MIN_CONTENT_WIDTH = 256;

export function SelectTrigger({
  children,
  buttonProps,
  onKeyDown,
  ...triggerProps
}: SelectTriggerProps) {
  const { hasValue, triggerValue } = useSelectContext();
  const popover = usePopoverContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "ArrowDown") return;
    event.preventDefault();
    popover.setOpen(true);
  };

  return (
    <Popover.Trigger
      {...triggerProps}
      onKeyDown={handleKeyDown}
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
  const anchored = useOverlayMode() !== "sheet";
  const minContentWidth = wideContent ? WIDE_MIN_CONTENT_WIDTH : MIN_CONTENT_WIDTH;

  return (
    <Popover.Content
      layerStyle={anchored ? "dropdown.surface" : undefined}
      minW={anchored && contentWidth == null ? minContentWidth : undefined}
      width={anchored && sameWidth ? "full" : undefined}
      style={
        anchored && contentWidth != null ? { width: toCssSize(contentWidth), ...style } : style
      }
      {...props}
    >
      {children}
    </Popover.Content>
  );
}

export function SelectSearch({ children, ...props }: SelectSearchProps) {
  const { managed } = useSelectContext();
  // On a phone, focusing the search raises the keyboard over half the sheet.
  const sheet = useOverlayMode() === "sheet";

  return (
    <ListboxSearchField
      {...props}
      autoFocus={sheet ? false : props.autoFocus}
      data-no-autofocus={sheet ? "" : undefined}
      search={managed.controller.search}
      inputRef={managed.inputRef}
      endElement={children}
    />
  );
}

export function SelectList(props: SelectListProps) {
  const { managed, list } = useSelectContext();

  return (
    <ManagedList
      managed={managed}
      {...list}
      contentProps={props}
    />
  );
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
        {footer != null && <Box>{footer}</Box>}
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
  ItemIndicator: Listbox.ItemIndicator,
  ItemActions: Listbox.ItemActions,
  ItemGroup: Listbox.ItemGroup,
  ItemGroupLabel: Listbox.ItemGroupLabel,
  Footer: Box,
};
