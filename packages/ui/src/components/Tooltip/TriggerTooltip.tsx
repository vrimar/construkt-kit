import {
  PresenceProvider,
  type UsePresenceContext,
  usePresenceContext,
} from "@ark-ui/react/presence";
import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import type { WithRef } from "../../types";
import { TooltipBase, type TooltipProps } from "./Tooltip";

export type WithTooltipProps = {
  tooltip?: ReactNode;
  tooltipProps?: Omit<TooltipProps, "children" | "label" | "ids">;
};

const SURFACE_PART_ATTRIBUTES = ["data-scope", "data-part"];

interface SurfaceApi {
  getTriggerProps: (props: { value: string | undefined }) => {
    id?: string | undefined;
    "aria-expanded"?: unknown;
  };
}

export type TooltipTriggerComponent<T extends ElementType> = (
  props: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>,
) => ReactElement;

/** Wraps a floating-surface trigger so `tooltip` renders against the trigger's own Ark id. */
export function withTriggerTooltip<T extends ElementType>(
  StyledTrigger: T,
  useSurfaceContext: () => SurfaceApi,
): TooltipTriggerComponent<T> {
  const TriggerElement: ElementType = StyledTrigger;

  // The Tooltip root provides its own presence, which the surface's trigger would read for `aria-controls`.
  function TooltipTarget({
    surfacePresence,
    ...props
  }: Record<string, unknown> & { surfacePresence: UsePresenceContext }) {
    return (
      <PresenceProvider value={surfacePresence}>
        <TriggerElement {...props} />
      </PresenceProvider>
    );
  }

  return function TooltipTrigger({
    tooltip,
    tooltipProps,
    children,
    ...rest
  }: WithRef<ComponentProps<T> & WithTooltipProps, HTMLButtonElement>): ReactElement {
    const triggerProps = useSurfaceContext().getTriggerProps({
      value: (rest as { value?: string }).value,
    });
    const surfacePresence = usePresenceContext();

    return (
      <TooltipBase
        ids={{ trigger: triggerProps.id ?? "" }}
        label={tooltip}
        stripTriggerAttributes={SURFACE_PART_ATTRIBUTES}
        {...tooltipProps}
        disabled={triggerProps["aria-expanded"] === true || tooltipProps?.disabled}
      >
        <TooltipTarget
          surfacePresence={surfacePresence}
          {...rest}
        >
          {children}
        </TooltipTarget>
      </TooltipBase>
    );
  };
}
