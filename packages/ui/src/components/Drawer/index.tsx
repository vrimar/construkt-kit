import { drawer } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import { type DialogContentProps, createDialogParts } from "../dialogParts";

export const Drawer = createDialogParts(drawer);

export type DrawerRootProps = ComponentProps<typeof Drawer.Root>;

export type DrawerContentProps = DialogContentProps;
