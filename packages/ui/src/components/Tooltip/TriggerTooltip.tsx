import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import { Tooltip, type TooltipProps } from ".";
import type { WithRef } from "../../types";

export type WithTooltipProps = {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "content" | "ids">;
};

interface TriggerTooltipProps {
  triggerId: string;
  tooltip: ReactNode;
  tooltipProps?: WithTooltipProps["tooltipProps"];
  children: ReactNode;
}

export function TriggerTooltip({
  triggerId,
  tooltip,
  tooltipProps,
  children,
}: TriggerTooltipProps) {
  return (
    <Tooltip
      ids={{ trigger: triggerId }}
      content={tooltip}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
}

/** Wraps a floating-surface trigger so `tooltip` renders against the trigger's own Ark id. */
export function withTriggerTooltip<T extends ElementType>(
  StyledTrigger: T,
  useTriggerId: (value: string) => string,
) {
  const TriggerElement: ElementType = StyledTrigger;

  return function TooltipTrigger({
    tooltip,
    tooltipProps,
    children,
    ...rest
  }: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>): ReactElement {
    const triggerId = useTriggerId((rest as { value?: string }).value ?? "");
    const trigger = <TriggerElement {...rest}>{children}</TriggerElement>;

    if (tooltip == null || tooltip === false || tooltipProps?.disabled) return trigger;

    return (
      <TriggerTooltip
        triggerId={triggerId}
        tooltip={tooltip}
        tooltipProps={tooltipProps}
      >
        {trigger}
      </TriggerTooltip>
    );
  };
}
