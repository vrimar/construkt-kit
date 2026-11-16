import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { ark } from "@ark-ui/react/factory";
import * as React from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { checkboxCard } from "#styled-system/recipes";

import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody } from "../cardBody";
import { Checkbox } from "../Checkbox";
import { isRenderable } from "../itemSlots";

const { withProvider, withContext } = createSlotRecipeContext(checkboxCard);

const CardRoot = withProvider(ArkCheckbox.Root, "root");
const CardControl = withContext(ark.div, "control");
const CardCheckbox = withContext(ArkCheckbox.Control, "checkbox");
const CardContent = withContext(ark.div, "content");
const CardLabel = withContext(ark.span, "label");
const CardDescription = withContext(ark.span, "description");
const CardAddon = withContext(ark.div, "addon");

const CardBody = createCardBody({
  Body: CardControl,
  Content: CardContent,
  Control: CardCheckbox,
  Label: CardLabel,
  Description: CardDescription,
  Addon: CardAddon,
});

type CardRootProps = React.ComponentProps<typeof CardRoot>;

export interface CheckboxCardProps
  extends Omit<CardRootProps, "ref">, HiddenInputControlProps, CardBodyProps {}

export const CheckboxCard = ({
  ref,
  inputProps,
  rootRef,
  label,
  description,
  icon,
  addon,
  indicator = <Checkbox.Indicator />,
  indicatorPlacement,
  ...rest
}: WithRef<CheckboxCardProps, HTMLInputElement>) => {
  const descriptionId = React.useId();
  const described = isRenderable(description);

  return (
    <CardRoot
      ref={rootRef}
      {...rest}
    >
      <ArkCheckbox.HiddenInput
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
    </CardRoot>
  );
};
