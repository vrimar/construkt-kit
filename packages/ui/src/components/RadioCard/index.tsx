import { type ComponentProps, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { radioCardGroup } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { joinIds } from "../../primitives/field";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody } from "../cardBody";
import { isRenderable } from "../itemSlots";
import {
  type RadioGroupRootOptions,
  type RadioItemOptions,
  RadioGroupProvider,
  RadioItemProvider,
  useRadioGroupLabelProps,
  useRadioGroupRoot,
  useRadioIndicator,
  useRadioItem,
  useRadioItemContext,
} from "../radioGroup";

const { withProvider, withContext } = createSlotRecipeContext(radioCardGroup);

const StyledRoot = withProvider(renderable.div, "root");
const StyledIndicator = withContext(renderable.div, "indicator");
const ItemRoot = withContext(renderable.label, "item");
const ItemBody = withContext(renderable.div, "itemBody");
const StyledItemControl = withContext(renderable.div, "itemControl");
const StyledItemIndicator = withContext(renderable.span, "itemIndicator");
const StyledItemText = withContext(renderable.span, "itemText");
const ItemContent = withContext(renderable.div, "itemContent");
const ItemDescription = withContext(renderable.span, "itemDescription");
const ItemAddon = withContext(renderable.div, "itemAddon");
const StyledLabel = withContext(renderable.span, "label");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface RadioCardRootProps
  extends Omit<StyledRootProps, keyof RadioGroupRootOptions>, RadioGroupRootOptions {}

function Root({
  ref,
  value,
  defaultValue,
  onValueChange,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  orientation,
  id,
  ...props
}: RadioCardRootProps) {
  const { context, rootProps } = useRadioGroupRoot({
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    orientation,
    id,
  });
  const composedRef = useComposedRefs(rootProps.ref, ref);

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot
        {...rootProps}
        {...props}
        ref={composedRef}
      />
    </RadioGroupProvider>
  );
}

function Label(props: ComponentProps<typeof StyledLabel>) {
  return (
    <StyledLabel
      {...mergeProps<ComponentProps<typeof StyledLabel>>(useRadioGroupLabelProps(), props)}
    />
  );
}

/** Slides to the checked item. */
function Indicator(props: ComponentProps<typeof StyledIndicator>) {
  const { style, ...indicator } = useRadioIndicator();
  return (
    <StyledIndicator
      {...indicator}
      {...props}
      style={{ ...style, ...props.style }}
    />
  );
}

function ItemControl(props: ComponentProps<typeof StyledItemControl>) {
  const { attributes } = useRadioItemContext("RadioCard.ItemControl");
  return (
    <StyledItemControl
      aria-hidden
      {...attributes}
      {...props}
    />
  );
}

function ItemText(props: ComponentProps<typeof StyledItemText>) {
  const { attributes, textId } = useRadioItemContext("RadioCard.ItemText");
  return (
    <StyledItemText
      id={textId}
      {...attributes}
      {...props}
    />
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
  const descriptionId = useId();
  const described = isRenderable(description);
  const {
    item,
    itemProps,
    inputProps: itemInputProps,
  } = useRadioItem({
    value,
    disabled,
    invalid,
  });

  return (
    <RadioItemProvider value={item}>
      <ItemRoot
        ref={rootRef}
        {...mergeProps<ItemRootProps>(itemProps, rest)}
      >
        <renderable.input
          {...mergeProps<ComponentProps<typeof renderable.input>>(itemInputProps, {
            ...inputProps,
            "aria-describedby": joinIds([
              described ? descriptionId : undefined,
              inputProps?.["aria-describedby"],
            ]),
          })}
          ref={ref}
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
