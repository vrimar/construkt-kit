import type { JSX } from "react";

import type {
  MultipleSelectionProps,
  SelectionMode,
  SelectionValue,
  SingleSelectionProps,
} from "../Listbox/types";
import {
  SelectContent,
  SelectSimpleBody,
  SelectTrigger,
  selectListParts,
  splitSelectBodyProps,
} from "./Select.parts";
import type { SelectProps, SelectRootProps, SelectSimpleProps } from "./Select.types";
import { SelectRootImpl } from "./SelectRoot";

export type {
  SelectContentProps,
  SelectFooterProps,
  SelectItemActionHelpers,
  SelectItemActionsProps,
  SelectItemGroupLabelProps,
  SelectItemGroupProps,
  SelectItemIndicatorProps,
  SelectItemProps,
  SelectItemTextProps,
  SelectListProps,
  SelectProps,
  SelectRootProps,
  SelectSearchProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select.types";

function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & SingleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & MultipleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>(props: SelectProps<T, V, SelectionMode>) {
  const [bodyProps, rootProps] = splitSelectBodyProps(props);

  return (
    <SelectRootImpl {...rootProps}>
      <SelectSimpleBody {...bodyProps} />
    </SelectRootImpl>
  );
}

interface SelectRootComponent {
  <T, V extends SelectionValue>(props: SelectRootProps<T, V>): JSX.Element;
  <T, V extends SelectionValue>(props: SelectRootProps<T, V, "multiple">): JSX.Element;
}

const Root: SelectRootComponent = SelectRootImpl;

export const Select = Object.assign(SelectSimple, {
  Root,
  Trigger: SelectTrigger,
  Content: SelectContent,
  ...selectListParts,
});
