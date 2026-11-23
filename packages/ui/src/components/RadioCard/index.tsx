import { type ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { radioCardGroup } from "#styled-system/recipes";

import { joinIds } from "../../primitives/field";
import { mergeProps, renderable } from "../../primitives/render";
import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody, useCardDescription } from "../cardBody";
import {
  type RadioGroupRootOptions,
  type RadioItemOptions,
  RadioGroupProvider,
  RadioItemHiddenInput,
  RadioItemProvider,
  createRadioGroupParts,
  useRadioGroupRoot,
  useRadioItem,
  useRadioItemContext,
} from "../radioGroup";

const { withProvider, withContext } = createSlotRecipeContext(radioCardGroup);

const StyledRoot = withProvider(renderable.div, "root");
const ItemRoot = withContext(renderable.label, "item");
const ItemBody = withContext(renderable.div, "itemBody");
const StyledItemIndicator = withContext(renderable.span, "itemIndicator");
const ItemContent = withContext(renderable.div, "itemContent");
const ItemDescription = withContext(renderable.span, "itemDescription");
const ItemAddon = withContext(renderable.div, "itemAddon");

const { Label, Indicator, ItemControl, ItemText } = createRadioGroupParts(
  {
    Label: withContext(renderable.span, "label"),
    Indicator: withContext(renderable.div, "indicator"),
    ItemControl: withContext(renderable.div, "itemControl"),
    ItemText: withContext(renderable.span, "itemText"),
  },
  "RadioCard",
);

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface RadioCardRootProps
  extends Omit<StyledRootProps, keyof RadioGroupRootOptions>, RadioGroupRootOptions {}

function Root(props: RadioCardRootProps) {
  const { context, rootProps } = useRadioGroupRoot(props);

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot {...rootProps} />
    </RadioGroupProvider>
  );
}

/** The dot drawn inside a checked item's radio. */
function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  const { state } = useRadioItemContext("RadioCard.ItemIndicator");

  return (
    <StyledItemIndicator
      hidden={!state.checked}
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
  extends
    Omit<ItemRootProps, "ref" | "children" | keyof RadioItemOptions>,
    RadioItemOptions,
    HiddenInputControlProps,
    CardBodyProps {}

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
  value,
  disabled,
  invalid,
  ...rest
}: WithRef<RadioCardItemProps, HTMLInputElement>) {
  const descriptionId = useCardDescription(description);
  const { item, itemProps } = useRadioItem({ value, disabled, invalid, id: rest.id });

  return (
    <RadioItemProvider value={item}>
      <ItemRoot
        ref={rootRef}
        {...mergeProps<ItemRootProps>(itemProps, rest)}
      >
        <RadioItemHiddenInput
          {...inputProps}
          aria-describedby={joinIds([descriptionId, inputProps?.["aria-describedby"]])}
          ref={ref}
        />
        <CardBody
          descriptionId={descriptionId}
          icon={icon}
          label={label}
          description={description}
          addon={addon}
          indicator={indicator}
          indicatorPlacement={indicatorPlacement}
        />
      </ItemRoot>
    </RadioItemProvider>
  );
}

export const RadioCard = {
  Root,
  Indicator,
  Item,
  ItemIndicator,
  Label,
};
