import { Dialog as ArkDialog, DialogContext, useDialogContext } from "@ark-ui/react/dialog";
import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import { type ComponentProps, type RefObject } from "react";
import { createStyleContext, styled } from "@b3/styled-system/jsx";
import { dialog } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";
import { CloseButton } from "../Buttons";

const { withRootProvider, withContext } = createStyleContext(dialog);

const Root = withRootProvider(ArkDialog.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const RootProvider = withRootProvider(ArkDialog.RootProvider, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const Backdrop = withContext(ArkDialog.Backdrop, "backdrop");
const CloseTriggerPrimitive = withContext(ArkDialog.CloseTrigger, "closeTrigger");
const Content = withContext(ArkDialog.Content, "content");
const Description = withContext(ArkDialog.Description, "description");
const Positioner = withContext(ArkDialog.Positioner, "positioner");
const Title = withContext(ArkDialog.Title, "title");
const Trigger = withContext(ArkDialog.Trigger, "trigger");
const Body = withContext(ark.div, "body");
const Header = withContext(ark.div, "header");
const Footer = withContext(ark.div, "footer");

const StyledButton = styled(ark.button);

function CloseTrigger({
  ref,
  children,
  ...props
}: WithRef<ComponentProps<typeof CloseTriggerPrimitive>, HTMLButtonElement>) {
  if (children) {
    return (
      <CloseTriggerPrimitive
        {...props}
        ref={ref}
      >
        {children}
      </CloseTriggerPrimitive>
    );
  }

  return (
    <CloseTriggerPrimitive
      {...props}
      asChild
      ref={ref}
    >
      <CloseButton size="sm" />
    </CloseTriggerPrimitive>
  );
}

function ActionTrigger({
  ref,
  ...props
}: WithRef<ComponentProps<typeof StyledButton>, HTMLButtonElement>) {
  const dialogCtx = useDialogContext();

  return (
    <StyledButton
      ref={ref}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) dialogCtx.setOpen(false);
      }}
    />
  );
}

export type DialogRootProps = ComponentProps<typeof Root>;

export interface DialogContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
  backdrop?: boolean;
}

function DialogContent({
  ref,
  portalled = true,
  portalRef,
  backdrop = true,
  ...rest
}: WithRef<DialogContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      {backdrop && <Backdrop />}
      <Positioner>
        <Content
          ref={ref}
          {...rest}
        />
      </Positioner>
    </Portal>
  );
}

export const Dialog = {
  Root,
  RootProvider,
  Backdrop,
  CloseTrigger,
  Content: DialogContent,
  Description,
  Positioner,
  Title,
  Trigger,
  Body,
  Header,
  Footer,
  ActionTrigger,
  Context: DialogContext,
};
