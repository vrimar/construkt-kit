import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Box } from "#styled-system/jsx";
import type { DrawerVariantProps } from "#styled-system/recipes";

import type { WithRef } from "../../types";
import { type DialogLabelProps, type DialogRootBaseProps, useModalContext } from "../dialogParts";
import type { DrawerContentProps } from "../Drawer";
import { DrawerRoot, type DrawerSnapProps, drawerParts } from "../Drawer/drawerParts";
import { isRenderable } from "../itemSlots";

// Panda extracts style props only from JSX tags that start with a capital.
const { ModalContent, Grabber, GrabberIndicator, Header, Title, Body, Description } = drawerParts;

export type SheetRootProps = DialogRootBaseProps &
  DrawerSnapProps &
  Pick<DrawerVariantProps, "size"> &
  DialogLabelProps;

function SheetRoot(props: SheetRootProps): ReactElement {
  return (
    <DrawerRoot
      placement="bottom"
      {...props}
    />
  );
}

export interface SheetHeaderProps extends ComponentProps<typeof Header> {
  startElement?: ReactNode;
  endElement?: ReactNode;
}

function SheetHeader({ startElement, endElement, children, ...props }: SheetHeaderProps) {
  return (
    <Header
      flexDirection="row"
      alignItems="center"
      gap="1"
      minHeight="11"
      py="0"
      ps={isRenderable(startElement) ? "1" : "4"}
      pe={isRenderable(endElement) ? "2" : "4"}
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
    </Header>
  );
}

function SheetTitle(props: ComponentProps<typeof Title>) {
  return (
    <Title
      textStyle="md"
      truncate
      {...props}
    />
  );
}

function SheetBody(props: ComponentProps<typeof Body>) {
  return (
    <Body
      alignItems="stretch"
      minHeight="0"
      {...props}
    />
  );
}

function RootTitleHeader({
  headerStart,
  headerEnd,
}: {
  headerStart: ReactNode;
  headerEnd: ReactNode;
}) {
  const { title, description } = useModalContext();
  if (title == null) return null;
  return (
    <SheetHeader
      startElement={headerStart}
      endElement={headerEnd}
    >
      <SheetTitle>{title}</SheetTitle>
      {description != null && <Description>{description}</Description>}
    </SheetHeader>
  );
}

export interface SheetContentProps extends DrawerContentProps {
  /** Hold the sheet at its maximum height instead of fitting its content. */
  fullHeight?: boolean;
  /** Shown before the root's `title`, such as a back button. */
  headerStart?: ReactNode;
  /** Shown after the root's `title`, such as a Done button. */
  headerEnd?: ReactNode;
}

function SheetContent({
  ref,
  fullHeight = false,
  headerStart,
  headerEnd,
  children,
  ...props
}: WithRef<SheetContentProps>): ReactElement {
  return (
    <ModalContent
      ref={ref}
      header={null}
      height={fullHeight ? "var(--drawer-placement-max-h)" : undefined}
      {...props}
    >
      <Grabber>
        <GrabberIndicator />
      </Grabber>
      <RootTitleHeader
        headerStart={headerStart}
        headerEnd={headerEnd}
      />
      {children}
    </ModalContent>
  );
}

export const Sheet = {
  Root: SheetRoot,
  Trigger: drawerParts.Trigger,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description,
  Body: SheetBody,
  Footer: drawerParts.Footer,
  CloseTrigger: drawerParts.CloseTrigger,
  ActionTrigger: drawerParts.ActionTrigger,
};
