import { HoverCard as ArkHoverCard, HoverCardContext } from "@ark-ui/react/hover-card";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";
import { createStyleContext } from "styled-system/jsx";
import { hoverCard } from "styled-system/recipes";

import type { WithRef } from "../../types";

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

function HoverCardRoot({ placement, ...rest }: HoverCardRootProps) {
  return (
    <Root
      positioning={{ placement }}
      {...rest}
    />
  );
}

export interface HoverCardContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
}

function HoverCardContent({
  ref,
  portalled = true,
  portalRef,
  ...rest
}: WithRef<HoverCardContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Positioner>
        <Content
          animation="none"
          ref={ref}
          {...rest}
        />
      </Positioner>
    </Portal>
  );
}

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
