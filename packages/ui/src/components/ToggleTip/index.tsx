import { InfoIcon } from "lucide-react";
import { type ReactNode, isValidElement } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { IconButton } from "../Buttons";
import { Popover, type PopoverRootProps } from "../Popover";

const TRIGGER_GUTTER = 4;

export interface ToggleTipProps extends Omit<PopoverRootProps, "mobileLayout">, PortalledProps {
  showArrow?: boolean;
  label?: ReactNode;
}

export type InfoTipProps = Partial<Omit<ToggleTipProps, "label">>;

export const ToggleTip = ({
  ref,
  showArrow,
  children,
  portalled,
  label,
  portalRef,
  ...rest
}: WithRef<ToggleTipProps>) => {
  return (
    <Popover.Root
      {...rest}
      mobileLayout="popover"
      positioning={{ gutter: TRIGGER_GUTTER, ...rest.positioning }}
    >
      <Popover.Trigger asChild={isValidElement(children)}>{children}</Popover.Trigger>
      <Popover.Content
        portalled={portalled}
        portalRef={portalRef}
        width="auto"
        px="2"
        py="1"
        textStyle="xs"
        rounded="sm"
        ref={ref}
      >
        {showArrow && <Popover.Arrow />}
        {label}
      </Popover.Content>
    </Popover.Root>
  );
};

export const InfoTip = (props: InfoTipProps) => {
  const { children, ...rest } = props;
  return (
    <ToggleTip
      label={children}
      {...rest}
    >
      <IconButton
        variant="plain"
        aria-label="info"
        size="2xs"
      >
        <InfoIcon />
      </IconButton>
    </ToggleTip>
  );
};
