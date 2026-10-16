import type { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import type { Drawer as ArkDrawer } from "@ark-ui/react/drawer";
import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";

import { type HTMLStyledProps, type SlotRecipeContext, styled } from "#styled-system/jsx";
import type { dialog } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../types";
import { createCloseTrigger } from "./closeTrigger";

export interface DialogContentProps
  extends HTMLStyledProps<typeof ArkDialog.Content>, PortalledProps {
  backdrop?: boolean;
}

type ArkPart<K extends keyof typeof ArkDialog & keyof typeof ArkDrawer> =
  | (typeof ArkDialog)[K]
  | (typeof ArkDrawer)[K];

interface ArkDialogParts {
  Backdrop: ArkPart<"Backdrop">;
  Content: ArkPart<"Content">;
  Positioner: ArkPart<"Positioner">;
  Title: ArkPart<"Title">;
  Description: ArkPart<"Description">;
  Trigger: ArkPart<"Trigger">;
  CloseTrigger: ArkPart<"CloseTrigger">;
}

interface DialogPartsOptions {
  useApi: () => { setOpen: (open: boolean) => void };
  useContentProps?: (props: DialogContentProps) => Partial<DialogContentProps>;
}

const StyledButton = styled(ark.button);

export function createDialogParts(
  withContext: SlotRecipeContext<typeof dialog>["withContext"],
  Ark: ArkDialogParts,
  { useApi, useContentProps }: DialogPartsOptions,
) {
  const Backdrop = withContext(Ark.Backdrop, "backdrop");
  const Content = withContext(Ark.Content, "content");
  const Positioner = withContext(Ark.Positioner, "positioner");

  function DialogContent({
    ref,
    portalled = true,
    portalRef,
    backdrop = true,
    ...rest
  }: WithRef<DialogContentProps>) {
    const contentProps = useContentProps?.(rest);

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
            {...contentProps}
          />
        </Positioner>
      </Portal>
    );
  }

  function ActionTrigger({
    ref,
    ...props
  }: WithRef<ComponentProps<typeof StyledButton>, HTMLButtonElement>) {
    const api = useApi();

    return (
      <StyledButton
        ref={ref}
        {...props}
        onClick={(e) => {
          props.onClick?.(e);
          if (!e.defaultPrevented) api.setOpen(false);
        }}
      />
    );
  }

  return {
    Backdrop,
    CloseTrigger: createCloseTrigger(withContext(Ark.CloseTrigger, "closeTrigger")),
    Content: DialogContent,
    Description: withContext(Ark.Description, "description"),
    Positioner,
    Title: withContext(Ark.Title, "title"),
    Trigger: withContext(Ark.Trigger, "trigger"),
    Body: withContext(ark.div, "body"),
    Header: withContext(ark.div, "header"),
    Footer: withContext(ark.div, "footer"),
    ActionTrigger,
  };
}
