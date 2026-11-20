import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import type { WithRef } from "../../types";
import { Tooltip, type TooltipProps } from "./Tooltip";

export type WithTooltipProps = {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "label">;
};

export type TooltipTriggerComponent<T extends ElementType> = (
  props: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>,
) => ReactElement;

/** Wraps a floating-surface trigger so `tooltip` shows on it while its surface is closed. */
export function withTriggerTooltip<T extends ElementType>(
  Trigger: T,
  useExpanded: (props: { value?: string }) => boolean,
): TooltipTriggerComponent<T> {
  const TriggerElement: ElementType = Trigger;

  return function TooltipTrigger({ tooltip, tooltipProps, ...rest }) {
    const expanded = useExpanded(rest as { value?: string });
    return (
      <Tooltip
        label={tooltip}
        {...tooltipProps}
        disabled={expanded || tooltipProps?.disabled}
      >
        <TriggerElement {...rest} />
      </Tooltip>
    );
  };
}
