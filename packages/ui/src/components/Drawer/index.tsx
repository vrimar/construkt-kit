import type { ComponentProps } from "react";

import { drawer } from "#styled-system/recipes";

import { type DialogContentProps, createDialogParts } from "../dialogParts";

export const Drawer = createDialogParts(drawer);

export type DrawerRootProps = ComponentProps<typeof Drawer.Root>;

export type DrawerContentProps = DialogContentProps;
