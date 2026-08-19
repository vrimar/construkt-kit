import { HoverCard as ArkHoverCard, HoverCardContext } from "@ark-ui/react/hover-card";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { hoverCard } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import type { PortalledProps } from "../../types";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createStyleContext(hoverCard);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkHoverCard.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const RootProvider = withRootProvider(ArkHoverCard.RootProvider, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const Arrow = withContext(ArkHoverCard.Arrow, "arrow");
const ArrowTip = withContext(ArkHoverCard.ArrowTip, "arrowTip");
const Content = withContext(ArkHoverCard.Content, "content");
const Positioner = withContext(ArkHoverCard.Positioner, "positioner");
const Trigger = withContext(ArkHoverCard.Trigger, "trigger");

export interface HoverCardRootProps extends RootProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const HoverCardRoot = createPlacementRoot<HoverCardRootProps>(Root);

export interface HoverCardContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const HoverCardContent = createPortalledContent(Positioner, Content);

export const HoverCard = {
  Root: HoverCardRoot,
  RootProvider,
  Arrow,
  ArrowTip,
  Content: HoverCardContent,
  Positioner,
  Trigger,
  Context: HoverCardContext,
};
