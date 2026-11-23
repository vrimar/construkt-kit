import type { ReactElement } from "react";

import type { DrawerVariantProps } from "#styled-system/recipes";

import type { DialogLabelProps, DialogRootBaseProps } from "../dialogParts";
import { type DrawerSnapProps, drawerParts } from "../Drawer/drawerParts";
import {
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetRoot,
  SheetTitle,
} from "./sheetParts";

export type { SheetContentProps, SheetHeaderProps } from "./sheetParts";

export type SheetRootProps = DialogRootBaseProps &
  DrawerSnapProps &
  Pick<DrawerVariantProps, "size"> &
  DialogLabelProps;

const Root: (props: SheetRootProps) => ReactElement = SheetRoot;

export const Sheet = {
  Root,
  Trigger: drawerParts.Trigger,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: drawerParts.Footer,
  CloseTrigger: drawerParts.CloseTrigger,
  ActionTrigger: drawerParts.ActionTrigger,
};
