import { Dialog as ArkDialog, DialogContext, useDialogContext } from "@ark-ui/react/dialog";
import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import {
  type StyleContext,
  type StyleContextConsumer,
  createStyleContext,
  styled,
} from "@construkt-kit/styled-system/jsx";
import type { dialog, drawer } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import type { PortalledProps, WithRef } from "../types";
import { createCloseTrigger } from "./closeTrigger";
import { lazyOverlayDefaults } from "./overlayDefaults";

export interface DialogContentProps
  extends ComponentProps<StyleContextConsumer<typeof ArkDialog.Content>>, PortalledProps {
  backdrop?: boolean;
}

const StyledButton = styled(ark.button);

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

export function createDialogParts<R extends typeof dialog | typeof drawer>(recipe: R) {
  const styleContext = createStyleContext(recipe);
  const { withRootProvider } = styleContext;
  const withContext = styleContext.withContext as StyleContext<typeof dialog>["withContext"];

  const Root = withRootProvider(ArkDialog.Root, { defaultProps: lazyOverlayDefaults });
  const RootProvider = withRootProvider(ArkDialog.RootProvider, {
    defaultProps: lazyOverlayDefaults,
  });
  const Backdrop = withContext(ArkDialog.Backdrop, "backdrop");
  const Content = withContext(ArkDialog.Content, "content");
  const Positioner = withContext(ArkDialog.Positioner, "positioner");

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

  return {
    Root,
    RootProvider,
    Backdrop,
    CloseTrigger: createCloseTrigger(withContext(ArkDialog.CloseTrigger, "closeTrigger")),
    Content: DialogContent,
    Description: withContext(ArkDialog.Description, "description"),
    Positioner,
    Title: withContext(ArkDialog.Title, "title"),
    Trigger: withContext(ArkDialog.Trigger, "trigger"),
    Body: withContext(ark.div, "body"),
    Header: withContext(ark.div, "header"),
    Footer: withContext(ark.div, "footer"),
    ActionTrigger,
    Context: DialogContext,
  };
}
