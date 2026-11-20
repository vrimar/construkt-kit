import { type ComponentProps, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { checkboxCard } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { joinIds } from "../../primitives/field";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody } from "../cardBody";
import {
  type CheckableProps,
  CheckableContext,
  useCheckable,
  useCheckableContext,
} from "../checkable";
import { Checkbox } from "../Checkbox";
import { isRenderable } from "../itemSlots";

const { withProvider, withContext } = createSlotRecipeContext(checkboxCard);

const CardRoot = withProvider(renderable.label, "root");
const CardControl = withContext(renderable.div, "control");
const StyledCardCheckbox = withContext(renderable.div, "checkbox");
const CardContent = withContext(renderable.div, "content");
const CardLabel = withContext(renderable.span, "label");
const CardDescription = withContext(renderable.span, "description");
const CardAddon = withContext(renderable.div, "addon");

function CardCheckbox(props: ComponentProps<typeof StyledCardCheckbox>) {
  const { stateAttributes } = useCheckableContext("CheckboxCard");
  return (
    <StyledCardCheckbox
      aria-hidden
      {...stateAttributes}
      {...props}
    />
  );
}

const CardBody = createCardBody({
  Body: CardControl,
  Content: CardContent,
  Control: CardCheckbox,
  Label: CardLabel,
  Description: CardDescription,
  Addon: CardAddon,
});

type CardRootProps = ComponentProps<typeof CardRoot>;

export interface CheckboxCardProps
  extends
    Omit<CardRootProps, "ref" | keyof CheckableProps>,
    CheckableProps,
    HiddenInputControlProps,
    CardBodyProps {}

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
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  value,
  form,
  id,
  ...rest
}: WithRef<CheckboxCardProps, HTMLInputElement>) => {
  const descriptionId = useId();
  const described = isRenderable(description);
  const checkable = useCheckable({
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    value,
    form,
    id,
  });
  const inputRef = useComposedRefs(checkable.inputProps.ref, ref);

  return (
    <CheckableContext value={checkable}>
      <CardRoot
        ref={rootRef}
        {...checkable.stateAttributes}
        {...mergeProps<CardRootProps>(checkable.rootProps, rest)}
      >
        <renderable.input
          {...mergeProps<ComponentProps<typeof renderable.input>>(checkable.inputProps, {
            ...inputProps,
            "aria-describedby": joinIds([
              checkable.inputProps["aria-describedby"],
              described ? descriptionId : undefined,
              inputProps?.["aria-describedby"],
            ]),
          })}
          ref={inputRef}
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
    </CheckableContext>
  );
};
