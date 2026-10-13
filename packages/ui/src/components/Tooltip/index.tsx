import { Tooltip as ArkTooltip, TooltipContext } from "@ark-ui/react/tooltip";
import { type ComponentProps, isValidElement } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkTooltip.Root, { defaultProps: lazyOverlayDefaults });
const ArrowTip = withContext(ArkTooltip.ArrowTip, "arrowTip");
const Arrow = withContext(ArkTooltip.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const Content = withContext(ArkTooltip.Content, "content");
const Positioner = withContext(ArkTooltip.Positioner, "positioner");
const Trigger = withContext(ArkTooltip.Trigger, "trigger");

export interface TooltipContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const TooltipContent = createPortalledContent(Positioner, Content);

export interface TooltipProps extends RootProps, PortalledProps {
  showArrow?: boolean;
  children: React.ReactNode | undefined;
  label: React.ReactNode;
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const TooltipComponent = ({
  ref,
  showArrow,
  children,
  portalled,
  label,
  portalRef,
  placement,
  positioning,
  ...rootProps
}: WithRef<TooltipProps>) => {
  if (label == null || label === false || label === "") return children;

  return (
    <Root
      openDelay={300}
      closeDelay={0}
      positioning={{ ...positioning, placement: placement ?? positioning?.placement ?? "top" }}
      {...rootProps}
    >
      <Trigger asChild>{isValidElement(children) ? children : <span>{children}</span>}</Trigger>
      <TooltipContent
        ref={ref}
        portalled={portalled}
        portalRef={portalRef}
      >
        {showArrow && <Arrow />}
        {label}
      </TooltipContent>
    </Root>
  );
};

export const Tooltip = Object.assign(TooltipComponent, {
  Root,
  Arrow,
  ArrowTip,
  Content: TooltipContent,
  Positioner,
  Trigger,
  Context: TooltipContext,
});
