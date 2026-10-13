import type { CollectionItem } from "@ark-ui/react/collection";
import {
  Combobox as ArkCombobox,
  ComboboxContext,
  type UseComboboxProps,
  type UseComboboxReturn,
  useCombobox as useArkCombobox,
  useComboboxItemContext,
} from "@ark-ui/react/combobox";
import { ark } from "@ark-ui/react/factory";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type ComboboxVariantProps, combobox } from "#styled-system/recipes";

import type { PortalledProps, StyledRootProps } from "../../types";
import { createItemIndicator } from "../itemIndicator";
import { createPortalledContent } from "../portalledContent";

const { withProvider, withContext } = createSlotRecipeContext(combobox);

type RootProps = StyledRootProps<ArkCombobox.RootBaseProps<CollectionItem>> & ComboboxVariantProps;

const StyledRoot = withProvider(ArkCombobox.Root, "root") as ArkCombobox.RootComponent<RootProps>;

function Root<T extends CollectionItem>({
  positioning,
  ...props
}: ArkCombobox.RootComponentProps<T, RootProps>) {
  return (
    <StyledRoot
      positioning={{ sameWidth: false, ...positioning }}
      {...props}
    />
  );
}

/** `useCombobox` for `Combobox.RootProvider`, sizing the content to its items like `Combobox.Root`. */
export function useCombobox<T extends CollectionItem>({
  positioning,
  ...props
}: UseComboboxProps<T>): UseComboboxReturn<T> {
  return useArkCombobox({ ...props, positioning: { sameWidth: false, ...positioning } });
}

export type { UseComboboxProps, UseComboboxReturn };

const RootProvider = withProvider(
  ArkCombobox.RootProvider,
  "root",
) as ArkCombobox.RootProviderComponent<RootProps>;

const ClearTrigger = withContext(ArkCombobox.ClearTrigger, "clearTrigger", {
  defaultProps: { children: <XIcon />, "aria-label": "Clear selection" },
});
const StyledContent = withContext(ArkCombobox.Content, "content");
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

const Content = createPortalledContent(Positioner, StyledContent);

const ItemIndicator = createItemIndicator(
  StyledItemIndicator,
  () => useComboboxItemContext().selected,
);

export type ComboboxRootProps = ComponentProps<typeof Root>;

export interface ComboboxContentProps
  extends ComponentProps<typeof StyledContent>, PortalledProps {}

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
