import type { KeyboardEvent, ReactNode } from "react";

import { styled } from "#styled-system/jsx";

import { toCssSize } from "../../foundations/cssSize";
import { splitKeys } from "../../foundations/props";
import { useFieldContext, useFieldTriggerProps } from "../../primitives/field";
import { NO_AUTOFOCUS_ATTRIBUTE } from "../../primitives/focus";
import { useOverlayMode } from "../../primitives/popup";
import { dataAttr, renderable } from "../../primitives/render";
import { SelectButton } from "../Buttons";
import { Listbox, ListboxSearchField, ManagedList } from "../Listbox/managed";
import { Popover } from "../Popover";
import { usePopoverContext } from "../Popover/internal";
import type { SelectionValue } from "../selection";
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
  render,
  children,
  buttonProps,
  onKeyDown,
  ...triggerProps
}: SelectTriggerProps) {
  const { hasValue, triggerValue } = useSelectContext();
  const popover = usePopoverContext();
  const fieldProps = useFieldTriggerProps(popover);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "ArrowDown") return;
    event.preventDefault();
    popover.requestOpenChange(true, "list-navigation", event.nativeEvent);
  };

  return (
    <Popover.Trigger
      {...fieldProps}
      {...triggerProps}
      onKeyDown={handleKeyDown}
      render={
        render ??
        children ?? (
          <SelectButton
            {...buttonProps}
            hasValue={buttonProps?.hasValue ?? hasValue}
            label={buttonProps?.label ?? triggerValue}
          />
        )
      }
    />
  );
}

function useListLabelledBy() {
  const field = useFieldContext();
  const popover = usePopoverContext();
  return field?.labelId ?? popover.triggerId;
}

export function SelectContent({ children, style, ...props }: SelectContentProps) {
  const { contentWidth, sameWidth, wideContent } = useSelectContext();
  const labelledBy = useListLabelledBy();
  const anchored = useOverlayMode() !== "sheet";
  const minContentWidth = wideContent ? WIDE_MIN_CONTENT_WIDTH : MIN_CONTENT_WIDTH;

  return (
    <Popover.Content
      aria-labelledby={labelledBy}
      layerStyle={anchored ? "dropdown.surface" : undefined}
      minW={anchored && contentWidth == null ? minContentWidth : undefined}
      width={anchored && sameWidth ? "var(--anchor-width)" : undefined}
      style={
        anchored && contentWidth != null ? { width: toCssSize(contentWidth), ...style } : style
      }
      {...props}
    >
      {children}
    </Popover.Content>
  );
}

export function SelectSearch({ children, autoFocus, ...props }: SelectSearchProps) {
  const { managed } = useSelectContext();
  // On a phone, focusing the search raises the keyboard over half the sheet.
  const sheet = useOverlayMode() === "sheet";
  const skipped = sheet || (autoFocus ?? managed.controller.search.autoFocus) === false;

  return (
    <ListboxSearchField
      {...props}
      autoFocus={false}
      {...{ [NO_AUTOFOCUS_ATTRIBUTE]: dataAttr(skipped) }}
      search={managed.controller.search}
      inputRef={managed.inputRef}
      endElement={children}
    />
  );
}

const SelectFooter = styled(renderable.div);

export function SelectList(props: SelectListProps) {
  const { managed, list } = useSelectContext();
  const labelledBy = useListLabelledBy();

  return (
    <ManagedList
      managed={managed}
      {...list}
      contentProps={{ "aria-labelledby": labelledBy, ...props }}
    />
  );
}

type SelectBodyProps = Pick<
  SelectSimpleProps<unknown, SelectionValue>,
  "contentCss" | "footer" | "listCss" | "triggerProps"
>;

const SELECT_BODY_KEYS = {
  contentCss: true,
  footer: true,
  listCss: true,
  triggerProps: true,
} as const satisfies Record<keyof SelectBodyProps, true>;

export function splitSelectBodyProps<P extends SelectBodyProps>(props: P) {
  const [bodyProps, rest] = splitKeys(props, SELECT_BODY_KEYS);
  return [bodyProps as SelectBodyProps, rest] as const;
}

export function SelectSimpleBody({
  triggerProps,
  contentCss,
  listCss,
  footer,
  children,
}: SelectBodyProps & { children?: ReactNode }) {
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
  ItemIndicator: Listbox.ItemIndicator,
  ItemActions: Listbox.ItemActions,
  ItemGroup: Listbox.ItemGroup,
  ItemGroupLabel: Listbox.ItemGroupLabel,
  Footer: SelectFooter,
};
