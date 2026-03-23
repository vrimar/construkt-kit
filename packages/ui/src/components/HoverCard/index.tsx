import { HoverCard as ArkHoverCard, HoverCardContext } from "@ark-ui/react/hover-card";
import type { ComponentProps } from "react";
import { createStyleContext } from "styled-system/jsx";
import { hoverCard } from "styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(hoverCard);

const Root = withRootProvider(ArkHoverCard.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const RootProvider = withRootProvider(ArkHoverCard.RootProvider);
const Arrow = withContext(ArkHoverCard.Arrow, "arrow");
const ArrowTip = withContext(ArkHoverCard.ArrowTip, "arrowTip");
const Content = withContext(ArkHoverCard.Content, "content");
const Positioner = withContext(ArkHoverCard.Positioner, "positioner");
const Trigger = withContext(ArkHoverCard.Trigger, "trigger");

export type HoverCardRootProps = ComponentProps<typeof Root>;

export const HoverCard = {
  Root,
  RootProvider,
  Arrow,
  ArrowTip,
  Content,
  Positioner,
  Trigger,
  Context: HoverCardContext,
};
