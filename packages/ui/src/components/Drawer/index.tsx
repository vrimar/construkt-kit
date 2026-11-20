import type { ReactElement } from "react";

import type { DrawerVariantProps } from "#styled-system/recipes";

import type { DialogContentProps, DialogLabelProps, DialogRootBaseProps } from "../dialogParts";
import { DrawerRoot, type DrawerSnapPoint, type DrawerSnapProps, drawerParts } from "./drawerParts";

export type { DrawerSnapPoint };

export type DrawerRootProps = DialogRootBaseProps &
  DrawerSnapProps &
  DrawerVariantProps &
  DialogLabelProps & {
    /** The side the drawer opens from; it swipes away towards the same side. @default "end" */
    placement?: DrawerVariantProps["placement"];
  };

export type DrawerContentProps = DialogContentProps;

const Root: (props: DrawerRootProps) => ReactElement = DrawerRoot;

export const Drawer = {
  Root,
  Trigger: drawerParts.Trigger,
  Content: drawerParts.Content,
  Header: drawerParts.Header,
  Title: drawerParts.Title,
  Description: drawerParts.Description,
  Body: drawerParts.Body,
  Footer: drawerParts.Footer,
  CloseTrigger: drawerParts.CloseTrigger,
  ActionTrigger: drawerParts.ActionTrigger,
  Grabber: drawerParts.Grabber,
  GrabberIndicator: drawerParts.GrabberIndicator,
};
