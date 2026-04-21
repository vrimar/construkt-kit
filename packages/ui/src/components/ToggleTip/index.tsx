import { Portal } from "@ark-ui/react/portal";
import { InfoIcon } from "lucide-react";
import type { ReactNode, RefObject } from "react";

import type { WithRef } from "../../types";
import { IconButton } from "../Buttons";
import * as ArkPopover from "../Popover";

export interface ToggleTipProps extends ArkPopover.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
  content?: ReactNode;
}

export const ToggleTip = ({
  ref,
  showArrow,
  children,
  portalled = true,
  content,
  portalRef,
  ...rest
}: WithRef<ToggleTipProps>) => {
  return (
    <ArkPopover.Root
      {...rest}
      positioning={{ gutter: 4, ...rest.positioning }}
    >
      <ArkPopover.Trigger asChild>{children}</ArkPopover.Trigger>
      <Portal
        disabled={!portalled}
        container={portalRef}
      >
        <ArkPopover.Positioner>
          <ArkPopover.Content
            width="auto"
            px="2"
            py="1"
            textStyle="xs"
            rounded="sm"
            ref={ref}
          >
            {showArrow && <ArkPopover.Arrow />}
            {content}
          </ArkPopover.Content>
        </ArkPopover.Positioner>
      </Portal>
    </ArkPopover.Root>
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
