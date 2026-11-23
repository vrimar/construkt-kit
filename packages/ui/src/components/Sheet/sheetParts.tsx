import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Box } from "#styled-system/jsx";
import type { DrawerVariantProps } from "#styled-system/recipes";

import { dataAttr } from "../../primitives/render";
import { type ModalRootProps, useModalContext } from "../dialogParts";
import type { DrawerContentProps } from "../Drawer";
import { DrawerRoot, type DrawerSnapProps, drawerParts } from "../Drawer/drawerParts";
import { isRenderable } from "../itemSlots";

// Panda extracts style props only from JSX tags that start with a capital.
const { ModalContent, Grabber, GrabberIndicator, Header, Title, Body, Description } = drawerParts;

export type SheetRootBaseProps = ModalRootProps &
  DrawerSnapProps &
  Pick<DrawerVariantProps, "size">;

/** The sheet root: `Sheet.Root` requires a name; a phone sheet's frame takes its overlay's. */
export function SheetRoot(props: SheetRootBaseProps): ReactElement {
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

export function SheetHeader({ startElement, endElement, children, ...props }: SheetHeaderProps) {
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

export function SheetTitle(props: ComponentProps<typeof Title>) {
  return (
    <Title
      textStyle="md"
      truncate
      {...props}
    />
  );
}

export const SheetDescription = Description;

export function SheetBody(props: ComponentProps<typeof Body>) {
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

export function SheetContent({
  ref,
  fullHeight = false,
  headerStart,
  headerEnd,
  children,
  ...props
}: SheetContentProps): ReactElement {
  return (
    <ModalContent
      ref={ref}
      header={null}
      data-full-height={dataAttr(fullHeight)}
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
