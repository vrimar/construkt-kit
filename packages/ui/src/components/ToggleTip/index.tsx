import { InfoIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { IconButton } from "../Buttons";
import { Popover, type PopoverRootProps } from "../Popover";

const TRIGGER_GUTTER = 4;

export interface ToggleTipProps extends PopoverRootProps, PortalledProps {
  showArrow?: boolean;
  content?: ReactNode;
}

export const ToggleTip = ({
  ref,
  showArrow,
  children,
  portalled,
  content,
  portalRef,
  ...rest
}: WithRef<ToggleTipProps>) => {
  return (
    <Popover.Root
      {...rest}
      positioning={{ gutter: TRIGGER_GUTTER, ...rest.positioning }}
    >
      <Popover.Trigger asChild>{children}</Popover.Trigger>
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
        {content}
      </Popover.Content>
    </Popover.Root>
  );
};

export const InfoTip = (props: Partial<ToggleTipProps>) => {
  const { children, ...rest } = props;
  return (
    <ToggleTip
      content={children}
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
