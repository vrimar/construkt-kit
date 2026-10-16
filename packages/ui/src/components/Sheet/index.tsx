import type { ComponentProps, ReactNode } from "react";

import { Box } from "#styled-system/jsx";

import type { WithRef } from "../../types";
import {
  Drawer,
  type DrawerContentProps,
  type DrawerRootProps,
  type UseDrawerProps,
  type UseDrawerReturn,
  useDrawer,
} from "../Drawer";

export type SheetRootProps = Omit<DrawerRootProps, "placement" | "swipeDirection">;

/** `useDrawer` for `Sheet.RootProvider`: a bottom drawer that swipes down to dismiss. */
export function useSheet(props: Omit<UseDrawerProps, "placement"> = {}): UseDrawerReturn {
  return useDrawer({ ...props, placement: "bottom" });
}

function SheetRoot(props: SheetRootProps) {
  return (
    <Drawer.Root
      placement="bottom"
      {...props}
    />
  );
}

export interface SheetContentProps extends DrawerContentProps {
  /** Hold the sheet at its maximum height instead of fitting its content. */
  fullHeight?: boolean;
}

function SheetContent({ ref, fullHeight = false, children, ...props }: WithRef<SheetContentProps>) {
  return (
    <Drawer.Content
      ref={ref}
      height={fullHeight ? "90dvh" : undefined}
      {...props}
    >
      <Drawer.Grabber>
        <Drawer.GrabberIndicator />
      </Drawer.Grabber>
      {children}
    </Drawer.Content>
  );
}

export interface SheetHeaderProps extends ComponentProps<typeof Drawer.Header> {
  startElement?: ReactNode;
  endElement?: ReactNode;
}

const isRendered = (node: ReactNode) => node != null && typeof node !== "boolean" && node !== "";

function SheetHeader({ startElement, endElement, children, ...props }: SheetHeaderProps) {
  return (
    <Drawer.Header
      flexDirection="row"
      alignItems="center"
      gap="1"
      minHeight="11"
      py="0"
      ps={isRendered(startElement) ? "1" : "4"}
      pe={isRendered(endElement) ? "2" : "4"}
      {...props}
    >
      {startElement}
      <Box
        flex="1"
        minWidth="0"
      >
        {children}
      </Box>
      {endElement}
    </Drawer.Header>
  );
}

function SheetTitle(props: ComponentProps<typeof Drawer.Title>) {
  return (
    <Drawer.Title
      textStyle="md"
      truncate
      {...props}
    />
  );
}

function SheetBody(props: ComponentProps<typeof Drawer.Body>) {
  return (
    <Drawer.Body
      alignItems="stretch"
      minHeight="0"
      {...props}
    />
  );
}

export const Sheet = {
  Root: SheetRoot,
  RootProvider: Drawer.RootProvider,
  Trigger: Drawer.Trigger,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: Drawer.Description,
  Body: SheetBody,
  Footer: Drawer.Footer,
  CloseTrigger: Drawer.CloseTrigger,
  ActionTrigger: Drawer.ActionTrigger,
  Context: Drawer.Context,
};
