import { Dialog as ArkDialog, DialogContext } from "@ark-ui/react/dialog";
import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";
import { createStyleContext } from "styled-system/jsx";
import { drawer } from "styled-system/recipes";

import type { WithRef } from "../../types";

const { withRootProvider, withContext } = createStyleContext(drawer);

const Root = withRootProvider(ArkDialog.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const RootProvider = withRootProvider(ArkDialog.RootProvider, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const Backdrop = withContext(ArkDialog.Backdrop, "backdrop");
const CloseTrigger = withContext(ArkDialog.CloseTrigger, "closeTrigger");
const Content = withContext(ArkDialog.Content, "content");
const Description = withContext(ArkDialog.Description, "description");
const Positioner = withContext(ArkDialog.Positioner, "positioner");
const Title = withContext(ArkDialog.Title, "title");
const Trigger = withContext(ArkDialog.Trigger, "trigger");
const Body = withContext(ark.div, "body");
const Header = withContext(ark.div, "header");
const Footer = withContext(ark.div, "footer");

export type DrawerRootProps = ComponentProps<typeof Root>;

export interface DrawerContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
}

function DrawerContent({ ref, portalled = true, portalRef, ...rest }: WithRef<DrawerContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Backdrop />
      <Content
        ref={ref}
        {...rest}
      />
    </Portal>
  );
}

export const Drawer = {
  Root,
  RootProvider,
  Backdrop,
  CloseTrigger,
  Content: DrawerContent,
  Description,
  Positioner,
  Title,
  Trigger,
  Body,
  Header,
  Footer,
  Context: DialogContext,
};
