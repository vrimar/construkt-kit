import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover, PopoverContext, usePopoverContext } from "@ark-ui/react/popover";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { popover } from "#styled-system/recipes";

import type { PortalledProps } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createSlotRecipeContext(popover);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkPopover.Root, { defaultProps: lazyOverlayDefaults });
const Anchor = withContext(ArkPopover.Anchor, "anchor");
const ArrowTip = withContext(ArkPopover.ArrowTip, "arrowTip");
const Arrow = withContext(ArkPopover.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");
const Content = withContext(ArkPopover.Content, "content");
const Description = withContext(ArkPopover.Description, "description");
const Indicator = withContext(ArkPopover.Indicator, "indicator");
const Positioner = withContext(ArkPopover.Positioner, "positioner");
const Title = withContext(ArkPopover.Title, "title");
const StyledTrigger = withContext(ArkPopover.Trigger, "trigger");

const Body = withContext(ark.div, "body");
const Header = withContext(ark.div, "header");
const Footer = withContext(ark.div, "footer");

export interface PopoverRootProps extends RootProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const PopoverRoot = createPlacementRoot<PopoverRootProps>(Root);

export interface PopoverContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const PopoverContent = createPortalledContent(Positioner, Content);

export interface PopoverTriggerProps
  extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const usePopoverTriggerId = (value: string) =>
  usePopoverContext().getTriggerProps({ value }).id ?? "";

const PopoverTrigger = withTriggerTooltip(StyledTrigger, usePopoverTriggerId);

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Anchor,
  Arrow,
  CloseTrigger: createCloseTrigger(CloseTrigger),
  Indicator,
  Positioner,
  Title,
  Description,
  Footer,
  Header,
  Body,
  Trigger: PopoverTrigger,
  Context: PopoverContext,
};
