import type { WithRef } from "../../types";
import type { TooltipProps } from "../Tooltip";
import { Tooltip } from "../Tooltip";
import type { ButtonProps } from "./Button";
import { IconButton } from "./IconButton";

export interface TooltipIconButtonProps extends ButtonProps {
  tooltipProps?: Omit<TooltipProps, "children" | "content">;
  label: string;
}

export const TooltipIconButton = ({
  ref,
  label,
  children,
  tooltipProps,
  ...props
}: WithRef<TooltipIconButtonProps>) => {
  return (
    <Tooltip
      ref={ref}
      content={label}
      {...tooltipProps}
    >
      <IconButton {...props}>{children}</IconButton>
    </Tooltip>
  );
};
