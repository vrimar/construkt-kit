import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover, usePopoverContext } from "@ark-ui/react/popover";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { popover } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { CloseButton } from "../Buttons";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createStyleContext(popover);

// Primitives — exported for sibling components (ToggleTip), not re-exported from barrel
export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(ArkPopover.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
export const Anchor = withContext(ArkPopover.Anchor, "anchor");
export const ArrowTip = withContext(ArkPopover.ArrowTip, "arrowTip");
export const Arrow = withContext(ArkPopover.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
export const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");
export const Content = withContext(ArkPopover.Content, "content");
export const Description = withContext(ArkPopover.Description, "description");
export const Indicator = withContext(ArkPopover.Indicator, "indicator");
export const Positioner = withContext(ArkPopover.Positioner, "positioner");
export const Title = withContext(ArkPopover.Title, "title");
const StyledTrigger = withContext(ArkPopover.Trigger, "trigger");

export const Body = withContext(ark.div, "body");
export const Header = withContext(ark.div, "header");
export const Footer = withContext(ark.div, "footer");

export { PopoverContext as Context } from "@ark-ui/react/popover";

export interface PopoverRootProps extends RootProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const PopoverRoot = createPlacementRoot<PopoverRootProps>(Root);

export interface PopoverContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const PopoverContent = createPortalledContent(Positioner, Content);

function PopoverArrow({ ref, ...props }: WithRef<ComponentProps<typeof Arrow>>) {
  return (
    <Arrow
      {...props}
      ref={ref}
    />
  );
}

export interface PopoverTriggerProps
  extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const usePopoverTriggerId = (value: string) =>
  usePopoverContext().getTriggerProps({ value }).id ?? "";

const PopoverTrigger = withTriggerTooltip(StyledTrigger, usePopoverTriggerId);

export const Trigger = PopoverTrigger;

function PopoverCloseTrigger({
  ref,
  ...props
}: WithRef<ComponentProps<typeof CloseTrigger>, HTMLButtonElement>) {
  return (
    <CloseTrigger
      position="absolute"
      top="1"
      insetEnd="1"
      {...props}
      asChild
      ref={ref}
    >
      <CloseButton size="sm" />
    </CloseTrigger>
  );
}

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  CloseTrigger: PopoverCloseTrigger,
  Title,
  Description,
  Footer,
  Header,
  Body,
  Trigger,
};
