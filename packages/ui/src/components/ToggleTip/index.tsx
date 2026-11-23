import { InfoIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import type { WithRef } from "../../types";
import { IconButton } from "../Buttons";
import { isRenderable } from "../itemSlots";
import { Popover, type PopoverRootProps } from "../Popover";
import { PopoverRootWithGutter, usePopoverContext } from "../Popover/internal";
import { asRender } from "../renderContent";

const TRIGGER_GUTTER = 4;

export interface ToggleTipProps extends Omit<PopoverRootProps, "mobileLayout"> {
  showArrow?: boolean;
  label?: ReactNode;
}

export type InfoTipProps = Partial<Omit<ToggleTipProps, "label">>;

function ToggleTipContent(props: ComponentProps<typeof Popover.Content>) {
  const { triggerId } = usePopoverContext();
  return (
    <Popover.Content
      aria-labelledby={triggerId}
      {...props}
    />
  );
}

export const ToggleTip = ({
  ref,
  showArrow,
  children,
  label,
  ...rest
}: WithRef<ToggleTipProps>) => {
  // An empty label keeps the same trigger tree, so toggling it never remounts the child.
  const bare = !isRenderable(label);

  return (
    <PopoverRootWithGutter
      {...rest}
      disabled={bare || rest.disabled}
      mobileLayout="popover"
      gutter={TRIGGER_GUTTER}
    >
      <Popover.Trigger {...asRender(children)} />
      {!bare && (
        <ToggleTipContent
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
      )}
    </PopoverRootWithGutter>
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
