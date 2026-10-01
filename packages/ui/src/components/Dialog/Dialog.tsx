import type { ComponentProps } from "react";

import { dialog } from "#styled-system/recipes";

import { createDialogParts } from "../dialogParts";

export type { DialogContentProps } from "../dialogParts";

export const Dialog = createDialogParts(dialog);

export type DialogRootProps = ComponentProps<typeof Dialog.Root>;
