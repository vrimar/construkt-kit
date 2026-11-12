import {
  PresenceProvider,
  type UsePresenceContext,
  usePresenceContext,
} from "@ark-ui/react/presence";
import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import { Tooltip, type TooltipProps } from ".";
import type { WithRef } from "../../types";

export type WithTooltipProps = {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "label" | "ids">;
};

const TOOLTIP_PART_ATTRIBUTES = ["data-scope", "data-part"];

export type TooltipTriggerComponent<T extends ElementType> = (
  props: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>,
) => ReactElement;

/** Wraps a floating-surface trigger so `tooltip` renders against the trigger's own Ark id. */
export function withTriggerTooltip<T extends ElementType>(
  StyledTrigger: T,
  useTriggerState: (value: string | undefined) => { id: string; open: boolean },
): TooltipTriggerComponent<T> {
  const TriggerElement: ElementType = StyledTrigger;

  // The Tooltip root provides its own presence, which the surface's trigger would read for `aria-controls`.
  function TooltipTarget({
    surfacePresence,
    ...props
  }: Record<string, unknown> & { surfacePresence: UsePresenceContext }) {
    const triggerProps: Record<string, unknown> = { ...props };
    for (const key of TOOLTIP_PART_ATTRIBUTES) delete triggerProps[key];
    return (
      <PresenceProvider value={surfacePresence}>
        <TriggerElement {...triggerProps} />
      </PresenceProvider>
    );
  }

  return function TooltipTrigger({
    tooltip,
    tooltipProps,
    children,
    ...rest
  }: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>): ReactElement {
    const { id: triggerId, open } = useTriggerState((rest as { value?: string }).value);
    const surfacePresence = usePresenceContext();

    return (
      <Tooltip
        ids={{ trigger: triggerId }}
        label={tooltip}
        {...tooltipProps}
        disabled={open || tooltipProps?.disabled}
      >
        <TooltipTarget
          surfacePresence={surfacePresence}
          {...rest}
        >
          {children}
        </TooltipTarget>
      </Tooltip>
    );
  };
}
