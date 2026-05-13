import { Portal } from "@ark-ui/react/portal";
import type { ReactNode } from "react";

import { Tooltip, type TooltipProps } from ".";

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

export function TriggerTooltip({ triggerId, tooltip, tooltipProps, children }: TriggerTooltipProps) {
  const {
    showArrow,
    portalled = true,
    portalRef,
    contentProps,
    placement = "top",
    ...rootProps
  } = tooltipProps ?? {};

  return (
    <Tooltip.Root
      ids={{ trigger: triggerId }}
      positioning={{ placement }}
      openDelay={300}
      closeDelay={0}
      {...rootProps}
    >
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Portal
        disabled={!portalled}
        container={portalRef}
      >
        <Tooltip.Positioner zIndex="tooltip">
          <Tooltip.Content
            zIndex="tooltip"
            {...contentProps}
          >
            {showArrow && (
              <Tooltip.Arrow>
                <Tooltip.ArrowTip />
              </Tooltip.Arrow>
            )}
            {tooltip}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
