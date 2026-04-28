import {
  Combobox as ArkCombobox,
  ComboboxContext,
  useComboboxItemContext,
} from "@ark-ui/react/combobox";
import { ark } from "@ark-ui/react/factory";
import { type HTMLStyledProps, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { type ComboboxVariantProps, combobox } from "@construkt-kit/styled-system/recipes";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(combobox);

type RootProps = HTMLStyledProps<"div"> & ComboboxVariantProps;

const Root = withProvider(ArkCombobox.Root, "root", {
  defaultProps: { positioning: { sameWidth: false } },
}) as ArkCombobox.RootComponent<RootProps>;

const RootProvider = withProvider(
  ArkCombobox.RootProvider,
  "root",
) as ArkCombobox.RootProviderComponent<RootProps>;

const ClearTrigger = withContext(ArkCombobox.ClearTrigger, "clearTrigger", {
  defaultProps: { children: <XIcon /> },
});
const Content = withContext(ArkCombobox.Content, "content");
const Control = withContext(ArkCombobox.Control, "control");
const Empty = withContext(ArkCombobox.Empty, "empty");
const IndicatorGroup = withContext(ark.div, "indicatorGroup");
const Input = withContext(ArkCombobox.Input, "input");
const Item = withContext(ArkCombobox.Item, "item");
const ItemGroup = withContext(ArkCombobox.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkCombobox.ItemGroupLabel, "itemGroupLabel");
const ItemText = withContext(ArkCombobox.ItemText, "itemText");
const Label = withContext(ArkCombobox.Label, "label");
const List = withContext(ArkCombobox.List, "list");
const Positioner = withContext(ArkCombobox.Positioner, "positioner");
const Trigger = withContext(ArkCombobox.Trigger, "trigger", {
  defaultProps: { children: <ChevronsUpDownIcon /> },
});

const StyledItemIndicator = withContext(ArkCombobox.ItemIndicator, "itemIndicator");

function ItemIndicator({ ref, ...props }: WithRef<HTMLStyledProps<"div">>) {
  const item = useComboboxItemContext();

  return item.selected ? (
    <StyledItemIndicator
      ref={ref}
      {...props}
    >
      <CheckIcon />
    </StyledItemIndicator>
  ) : (
    <svg
      aria-hidden="true"
      focusable="false"
    />
  );
}

export type ComboboxRootProps = RootProps;

export const Combobox = {
  Root,
  RootProvider,
  ClearTrigger,
  Content,
  Control,
  Empty,
  IndicatorGroup,
  Input,
  Item,
  ItemGroup,
  ItemGroupLabel,
  ItemIndicator,
  ItemText,
  Label,
  List,
  Positioner,
  Trigger,
  Context: ComboboxContext,
};

export { createListCollection, useListCollection } from "@ark-ui/react/collection";
