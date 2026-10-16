import type { ComponentProps, ReactElement, ReactNode } from "react";

import type { Box, HTMLStyledProps } from "#styled-system/jsx";
import type { ListboxVariant } from "#styled-system/recipes";
import type { JsxStyleProps } from "#styled-system/types";

import type { CssProp, Unstyled } from "../../types";
import type { SelectButtonProps } from "../Buttons";
import type { SearchInputProps } from "../Input";
import type { Listbox } from "../Listbox/Listbox";
import type {
  ManagedListOptions,
  ManagedSelectionProps,
  MultipleSelectionProps,
  SelectionItemState,
  SelectionMode,
  SelectionProps,
  SelectionValue,
  SelectionValueRenderContext,
} from "../Listbox/types";
import type { MobileLayoutProps } from "../overlayPresentation";
import type { Popover, PopoverRootProps, PopoverTriggerProps } from "../Popover";

export type SelectValue = SelectionValue;

export interface SelectItemActionHelpers {
  /** Close the select, e.g. before an item action opens a dialog. */
  close: () => void;
}

export interface SelectRootBaseProps<T, V extends SelectionValue>
  extends
    ManagedSelectionProps<T, V>,
    Omit<ManagedListOptions<T, V>, "renderItemActions">,
    JsxStyleProps,
    MobileLayoutProps {
  children: ReactNode;
  renderItemActions?: (
    item: T,
    state: SelectionItemState<V>,
    helpers: SelectItemActionHelpers,
  ) => ReactNode;
  /** @default "Select item" */
  placeholder?: ReactNode;
  renderValue?: (context: SelectionValueRenderContext<T, V>) => ReactNode;
  /** Content width: px if a number, otherwise a size token or CSS length. */
  contentWidth?: string | number;
  /** Match content width to the trigger. @default true */
  matchTriggerWidth?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
  actionsVisibility?: ListboxVariant["actionsVisibility"];
}

export type SelectRootProps<
  T,
  V extends SelectionValue = SelectionValue,
  M extends SelectionMode = "single",
> = SelectRootBaseProps<T, V> & SelectionProps<V, M>;

export interface SelectTriggerProps extends Omit<PopoverTriggerProps, "children"> {
  children?: ReactElement;
  buttonProps?: Partial<Unstyled<SelectButtonProps>>;
}

export interface SelectSearchProps extends Omit<
  SearchInputProps,
  "defaultValue" | "onClear" | "value"
> {
  children?: ReactNode;
}

export type SelectContentProps = Partial<ComponentProps<typeof Popover.Content>>;
export type SelectListProps = HTMLStyledProps<"div">;
export type SelectItemProps<T> = Omit<ComponentProps<typeof Listbox.Item>, "item"> & { item: T };
export type SelectItemTextProps = ComponentProps<typeof Listbox.ItemText>;
export type SelectItemIndicatorProps = ComponentProps<typeof Listbox.ItemIndicator>;
export type SelectItemActionsProps = ComponentProps<typeof Listbox.ItemActions>;
export type SelectItemGroupProps = ComponentProps<typeof Listbox.ItemGroup>;
export type SelectItemGroupLabelProps = ComponentProps<typeof Listbox.ItemGroupLabel>;
export type SelectFooterProps = ComponentProps<typeof Box>;

export interface SelectSimpleProps<T, V extends SelectionValue> extends Omit<
  SelectRootBaseProps<T, V>,
  "children"
> {
  triggerProps?: Unstyled<SelectTriggerProps>;
  /** Styles for the dropdown content. */
  contentCss?: CssProp;
  /** Styles for the scrolling list inside the dropdown. */
  listCss?: CssProp;
  footer?: ReactNode;
}

export type SelectProps<
  T,
  V extends SelectionValue = SelectionValue,
  M extends SelectionMode = "single",
> = SelectSimpleProps<T, V> & SelectionProps<V, M>;

export type SelectMultipleValueProps<V extends SelectionValue> = Omit<
  MultipleSelectionProps<V>,
  "selectionMode"
>;
