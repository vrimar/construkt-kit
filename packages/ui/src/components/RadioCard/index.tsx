import { ark } from "@ark-ui/react/factory";
import { RadioGroup, RadioGroupContext, useRadioGroupItemContext } from "@ark-ui/react/radio-group";
import { type ComponentProps, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { radioCardGroup } from "#styled-system/recipes";

import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody } from "../cardBody";
import { isRenderable } from "../itemSlots";

const { withProvider, withContext } = createSlotRecipeContext(radioCardGroup);

const Root = withProvider(RadioGroup.Root, "root");
const RootProvider = withProvider(RadioGroup.RootProvider, "root");
const Indicator = withContext(RadioGroup.Indicator, "indicator");
const ItemRoot = withContext(RadioGroup.Item, "item");
const ItemBody = withContext(ark.div, "itemBody");
const ItemControl = withContext(RadioGroup.ItemControl, "itemControl");
const StyledItemIndicator = withContext(ark.span, "itemIndicator");
const ItemText = withContext(RadioGroup.ItemText, "itemText");
const ItemContent = withContext(ark.div, "itemContent");
const ItemDescription = withContext(ark.span, "itemDescription");
const ItemAddon = withContext(ark.div, "itemAddon");
const Label = withContext(RadioGroup.Label, "label");

/** The dot drawn inside a checked item's radio. */
function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  const { checked } = useRadioGroupItemContext();

  return (
    <StyledItemIndicator
      hidden={!checked}
      {...props}
    />
  );
}

const CardBody = createCardBody({
  Body: ItemBody,
  Content: ItemContent,
  Control: ItemControl,
  Label: ItemText,
  Description: ItemDescription,
  Addon: ItemAddon,
});

type ItemRootProps = ComponentProps<typeof ItemRoot>;

export interface RadioCardItemProps
  extends Omit<ItemRootProps, "ref" | "children">, HiddenInputControlProps, CardBodyProps {}

function Item({
  ref,
  inputProps,
  rootRef,
  icon,
  label,
  description,
  addon,
  indicator = <ItemIndicator />,
  indicatorPlacement,
  ...rest
}: WithRef<RadioCardItemProps, HTMLInputElement>) {
  const descriptionId = useId();
  const described = isRenderable(description);

  return (
    <ItemRoot
      ref={rootRef}
      {...rest}
    >
      <RadioGroup.ItemHiddenInput
        ref={ref}
        aria-describedby={described ? descriptionId : undefined}
        {...inputProps}
      />
      <CardBody
        descriptionId={described ? descriptionId : undefined}
        icon={icon}
        label={label}
        description={description}
        addon={addon}
        indicator={indicator}
        indicatorPlacement={indicatorPlacement}
      />
    </ItemRoot>
  );
}

export type RadioCardRootProps = ComponentProps<typeof Root>;

export const RadioCard = {
  Root,
  RootProvider,
  Indicator,
  Item,
  ItemIndicator,
  Label,
  Context: RadioGroupContext,
};

export {
  type UseRadioGroupProps,
  type UseRadioGroupReturn,
  useRadioGroup,
} from "@ark-ui/react/radio-group";
