import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import { Tooltip, type TooltipProps } from ".";
import type { WithRef } from "../../types";

export type WithTooltipProps = {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "label" | "ids">;
};

const TOOLTIP_STATE_ATTRIBUTES = ["data-state", "data-expanded", "data-scope", "data-part"];

export type TooltipTriggerComponent<T extends ElementType> = (
  props: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>,
) => ReactElement;

/** Wraps a floating-surface trigger so `tooltip` renders against the trigger's own Ark id. */
export function withTriggerTooltip<T extends ElementType>(
  StyledTrigger: T,
  useTriggerId: (value: string) => string,
): TooltipTriggerComponent<T> {
  const TriggerElement: ElementType = StyledTrigger;

  function TooltipTarget(props: Record<string, unknown>) {
    const triggerProps = { ...props };
    for (const key of TOOLTIP_STATE_ATTRIBUTES) delete triggerProps[key];
    return <TriggerElement {...triggerProps} />;
  }

  return function TooltipTrigger({
    tooltip,
    tooltipProps,
    children,
    ...rest
  }: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>): ReactElement {
    const triggerId = useTriggerId((rest as { value?: string }).value ?? "");

    if (tooltip == null || tooltip === false) {
      return <TriggerElement {...rest}>{children}</TriggerElement>;
    }

    return (
      <Tooltip
        ids={{ trigger: triggerId }}
        label={tooltip}
        {...tooltipProps}
      >
        <TooltipTarget {...rest}>{children}</TooltipTarget>
      </Tooltip>
    );
  };
}
