import { Tooltip as ArkTooltip, TooltipContext } from "@ark-ui/react/tooltip";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

type RootProps = ComponentProps<typeof Root>;
type ContentProps = ComponentProps<typeof Content>;
const Root = withRootProvider(ArkTooltip.Root, { defaultProps: lazyOverlayDefaults });
const ArrowTip = withContext(ArkTooltip.ArrowTip, "arrowTip");
const Arrow = withContext(ArkTooltip.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const Content = withContext(ArkTooltip.Content, "content");
const Positioner = withContext(ArkTooltip.Positioner, "positioner");
const Trigger = withContext(ArkTooltip.Trigger, "trigger");

const TooltipContent = createPortalledContent(Positioner, Content);

export { TooltipContext as Context } from "@ark-ui/react/tooltip";

export interface TooltipProps extends RootProps, PortalledProps {
  showArrow?: boolean;
  children: React.ReactNode | undefined;
  label: React.ReactNode;
  contentProps?: ContentProps;
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const TooltipComponent = ({
  ref,
  showArrow,
  children,
  portalled,
  label,
  contentProps,
  portalRef,
  placement = "top",
  ...rootProps
}: WithRef<TooltipProps>) => (
  <Root
    openDelay={300}
    closeDelay={0}
    positioning={{ placement }}
    {...rootProps}
  >
    <Trigger asChild>{children}</Trigger>
    <TooltipContent
      ref={ref}
      portalled={portalled}
      portalRef={portalRef}
      {...contentProps}
    >
      {showArrow && <Arrow />}
      {label}
    </TooltipContent>
  </Root>
);

export const Tooltip = Object.assign(TooltipComponent, {
  Root,
  Arrow,
  ArrowTip,
  Content,
  Positioner,
  Trigger,
  Context: TooltipContext,
});
