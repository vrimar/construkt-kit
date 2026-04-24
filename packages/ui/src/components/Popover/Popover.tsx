import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover } from "@ark-ui/react/popover";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { popover } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";
import { CloseButton } from "../Buttons";

const { withRootProvider, withContext } = createStyleContext(popover);

// Primitives — exported for sibling components (ToggleTip), not re-exported from barrel
export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(ArkPopover.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
export const RootProvider = withRootProvider(ArkPopover.Root, {
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
export const Trigger = withContext(ArkPopover.Trigger, "trigger");

export const Body = withContext(ark.div, "body");
export const Header = withContext(ark.div, "header");
export const Footer = withContext(ark.div, "footer");

export { PopoverContext as Context } from "@ark-ui/react/popover";

export interface PopoverRootProps extends RootProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

function PopoverRoot({ placement, ...rest }: PopoverRootProps) {
  return (
    <Root
      positioning={{ placement }}
      {...rest}
    />
  );
}

export interface PopoverContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
}

function PopoverContent({
  ref,
  portalled = true,
  portalRef,
  ...rest
}: WithRef<PopoverContentProps>) {
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

function PopoverArrow({ ref, ...props }: WithRef<ComponentProps<typeof Arrow>>) {
  return (
    <Arrow
      {...props}
      ref={ref}
    />
  );
}

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
