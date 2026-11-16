import { usePopoverContext } from "@ark-ui/react/popover";
import { InfoIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, isValidElement } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { IconButton } from "../Buttons";
import { isRenderable } from "../itemSlots";
import { Popover, type PopoverRootProps } from "../Popover";

const TRIGGER_GUTTER = 4;

export interface ToggleTipProps extends Omit<PopoverRootProps, "mobileLayout">, PortalledProps {
  showArrow?: boolean;
  label?: ReactNode;
}

export type InfoTipProps = Partial<Omit<ToggleTipProps, "label">>;

function ToggleTipContent(props: ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Content
      aria-labelledby={usePopoverContext().getTriggerProps().id}
      {...props}
    />
  );
}

export const ToggleTip = ({
  ref,
  showArrow,
  children,
  portalled,
  label,
  portalRef,
  ...rest
}: WithRef<ToggleTipProps>) => {
  if (!isRenderable(label)) return <>{children}</>;

  return (
    <Popover.Root
      {...rest}
      mobileLayout="popover"
      positioning={{ gutter: TRIGGER_GUTTER, ...rest.positioning }}
    >
      <Popover.Trigger asChild={isValidElement(children)}>{children}</Popover.Trigger>
      <ToggleTipContent
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
      </ToggleTipContent>
    </Popover.Root>
  );
};

export const InfoTip = (props: InfoTipProps) => {
  const { children, ...rest } = props;
  if (!isRenderable(children)) return null;

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
