import { RadioGroup, RadioGroupContext } from "@ark-ui/react/radio-group";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { radioCardGroup } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(radioCardGroup);

const Root = withProvider(RadioGroup.Root, "root");
const RootProvider = withProvider(RadioGroup.RootProvider, "root");
const Indicator = withContext(RadioGroup.Indicator, "indicator");
const Item = withContext(RadioGroup.Item, "item");
const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
const ItemText = withContext(RadioGroup.ItemText, "itemText");
const Label = withContext(RadioGroup.Label, "label");
const ItemHiddenInput = RadioGroup.ItemHiddenInput;

export type RadioCardRootProps = ComponentProps<typeof Root>;

export const RadioCard = {
  Root,
  RootProvider,
  Indicator,
  Item,
  ItemControl,
  ItemText,
  Label,
  ItemHiddenInput,
  Context: RadioGroupContext,
};
