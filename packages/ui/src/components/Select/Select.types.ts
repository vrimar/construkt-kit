import type { Box, HTMLStyledProps } from "@construkt-kit/styled-system/jsx";
import type { ChangeEvent, ComponentProps, ReactElement, ReactNode } from "react";

import type { SelectButtonProps } from "../Buttons";
import type { SearchInput } from "../Input";
import type { Listbox } from "../Listbox/Listbox";
import type {
  SelectionIndicatorPosition,
  SelectionItemState,
  SelectionItemsProps,
  SelectionProps,
  SelectionSearchOptions,
  SelectionValue,
  SelectionValueRenderContext,
} from "../Listbox/types";
import type { Popover, PopoverTriggerProps } from "../Popover";

export type SelectValue = SelectionValue;

export type PopoverContentProps = ComponentProps<typeof Popover.Content>;
export type PopoverRootProps = ComponentProps<typeof Popover.Root>;
export type ManagedItemProps = Partial<
  Omit<ComponentProps<typeof Listbox.Item>, "children" | "item">
>;

export interface SelectRenderProps<T, V extends SelectionValue> {
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  getItemProps?: (item: T) => ManagedItemProps;
}

export interface SelectRootBaseProps<T, V extends SelectionValue>
  extends SelectionItemsProps<T, V>, SelectRenderProps<T, V> {
  children: ReactNode;
  placeholder?: ReactNode;
  renderValue?: (context: SelectionValueRenderContext<T, V>) => ReactNode;
  indicatorPosition?: SelectionIndicatorPosition;
  contentWidth?: number;
  /** Match content width to the trigger. @default true */
  matchTriggerWidth?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
  actionsVisibility?: "hover" | "always";
  listboxProps?: Partial<ComponentProps<typeof Listbox.Root>>;
  search?: boolean | SelectionSearchOptions<T>;
  loading?: boolean;
  emptyMessage?: ReactNode;
  virtual?: boolean;
}

export type SelectRootProps<T, V extends SelectionValue = SelectionValue> = SelectRootBaseProps<
  T,
  V
> &
  SelectionProps<V>;

export interface SelectTriggerProps extends Omit<PopoverTriggerProps, "children"> {
  children?: ReactElement;
  buttonProps?: Partial<SelectButtonProps>;
}

type SearchInputProps = ComponentProps<typeof SearchInput>;

export interface SelectSearchProps extends Omit<
  SearchInputProps,
  "defaultValue" | "onChange" | "value"
> {
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type SelectContentProps = Partial<PopoverContentProps>;
export type SelectListProps = HTMLStyledProps<"div">;
export type SelectItemProps<T> = Omit<ComponentProps<typeof Listbox.Item>, "item"> & { item: T };
export type SelectItemTextProps = ComponentProps<typeof Listbox.ItemText>;
export type SelectItemIndicatorProps = ComponentProps<typeof Listbox.ItemIndicator>;
export type SelectItemActionsProps = ComponentProps<typeof Listbox.ItemActions>;
export type SelectFooterProps = ComponentProps<typeof Box>;

export interface SelectSimpleProps<T, V extends SelectionValue> extends Omit<
  SelectRootBaseProps<T, V>,
  "children"
> {
  triggerProps?: SelectTriggerProps;
  contentProps?: SelectContentProps;
  listProps?: SelectListProps;
  footer?: ReactNode;
}

export type SelectProps<T, V extends SelectionValue = SelectionValue> = SelectSimpleProps<T, V> &
  SelectionProps<V>;
