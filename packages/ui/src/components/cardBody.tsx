import type { ComponentType, ReactNode } from "react";

import { isRenderable } from "./itemSlots";

export interface CardBodyProps {
  icon?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  /** Shown below the card's body, past a divider. */
  addon?: ReactNode;
  /** Drawn inside the card's control. `null` leaves the control out. */
  indicator?: ReactNode;
  /** @default "end" */
  indicatorPlacement?: "start" | "end" | "inside";
}

type Slot = ComponentType<{ children?: ReactNode; id?: string }>;

interface CardBodySlots {
  Body: Slot;
  Content: Slot;
  Control: Slot;
  Label: Slot;
  Description: Slot;
  Addon: Slot;
}

export function createCardBody({
  Body,
  Content,
  Control,
  Label,
  Description,
  Addon,
}: CardBodySlots) {
  return function CardBody({
    descriptionId,
    icon,
    label,
    description,
    addon,
    indicator,
    indicatorPlacement = "end",
  }: CardBodyProps & { descriptionId?: string }) {
    const control = isRenderable(indicator) && <Control>{indicator}</Control>;
    const inside = indicatorPlacement === "inside" && control;
    const hasContent =
      inside || isRenderable(label) || isRenderable(description) || isRenderable(icon);

    return (
      <>
        <Body data-indicator-placement={indicatorPlacement}>
          {indicatorPlacement === "start" && control}
          {hasContent && (
            <Content>
              {icon}
              {isRenderable(label) && <Label>{label}</Label>}
              {isRenderable(description) && (
                <Description id={descriptionId}>{description}</Description>
              )}
              {inside}
            </Content>
          )}
          {indicatorPlacement === "end" && control}
        </Body>
        {isRenderable(addon) && <Addon>{addon}</Addon>}
      </>
    );
  };
}
