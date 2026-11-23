import { type ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { checkboxCard } from "#styled-system/recipes";

import { joinIds } from "../../primitives/field";
import { mergeProps, renderable } from "../../primitives/render";
import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CardBodyProps, createCardBody, useCardDescription } from "../cardBody";
import {
  type CheckableProps,
  CheckableContext,
  CheckableHiddenInput,
  splitCheckableProps,
  useCheckable,
  useCheckableContext,
} from "../checkable";
import { Checkbox } from "../Checkbox";

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
  ...props
}: WithRef<CheckboxCardProps, HTMLInputElement>) => {
  const descriptionId = useCardDescription(description);
  const [checkableProps, rest] = splitCheckableProps(props);
  const checkable = useCheckable(checkableProps);

  return (
    <CheckableContext value={checkable}>
      <CardRoot
        ref={rootRef}
        {...checkable.stateAttributes}
        {...mergeProps<CardRootProps>(checkable.rootProps, rest)}
      >
        <CheckableHiddenInput
          ref={ref}
          {...inputProps}
          aria-describedby={joinIds([
            checkable.inputProps["aria-describedby"],
            descriptionId,
            inputProps?.["aria-describedby"],
          ])}
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
      </CardRoot>
    </CheckableContext>
  );
};
