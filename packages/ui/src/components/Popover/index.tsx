import { Popover as ChakraPopover, Portal } from "@chakra-ui/react";
import React, { RefObject } from "react";

import { CloseButton } from "../Buttons";

export interface PopoverRootProps extends ChakraPopover.RootProps {
  placement?: NonNullable<ChakraPopover.RootProps["positioning"]>["placement"];
}

function Root({ placement, ...rest }: PopoverRootProps) {
  return (
    <ChakraPopover.Root
      lazyMount
      unmountOnExit
      positioning={{ placement }}
      {...rest}
    />
  );
}

export interface PopoverContentProps extends ChakraPopover.ContentProps {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
}

function Content({ ref, portalled = true, portalRef, ...rest }: PopoverContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <ChakraPopover.Positioner>
        <ChakraPopover.Content
          animation="none"
          ref={ref}
          {...rest}
        />
      </ChakraPopover.Positioner>
    </Portal>
  );
}

function Arrow({ ref, ...props }: ChakraPopover.ArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraPopover.Arrow
      {...props}
      ref={ref}
    >
      <ChakraPopover.ArrowTip />
    </ChakraPopover.Arrow>
  );
}

function CloseTrigger({ ref, ...props }: ChakraPopover.CloseTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ChakraPopover.CloseTrigger
      position="absolute"
      top="1"
      insetEnd="1"
      {...props}
      asChild
      ref={ref}
    >
      <CloseButton size="sm" />
    </ChakraPopover.CloseTrigger>
  );
}

export const Popover = {
  Root: Root,
  Content: Content,
  Arrow: Arrow,
  CloseTrigger: CloseTrigger,
  Title: ChakraPopover.Title,
  Description: ChakraPopover.Description,
  Footer: ChakraPopover.Footer,
  Header: ChakraPopover.Header,
  Body: ChakraPopover.Body,
  Trigger: ChakraPopover.Trigger,
};
