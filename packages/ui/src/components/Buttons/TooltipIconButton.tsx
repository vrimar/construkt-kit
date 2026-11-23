import { Tooltip } from "../Tooltip";
import type { WithTooltipProps } from "../Tooltip/TriggerTooltip";
import { IconButton, type IconButtonProps } from "./IconButton";

export interface TooltipIconButtonProps
  extends IconButtonProps, Pick<WithTooltipProps, "tooltipProps"> {
  label: string;
}

export const TooltipIconButton = ({
  ref,
  label,
  children,
  tooltipProps,
  ...props
}: TooltipIconButtonProps) => {
  return (
    <Tooltip
      label={label}
      {...tooltipProps}
    >
      <IconButton
        ref={ref}
        aria-label={label}
        {...props}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};
