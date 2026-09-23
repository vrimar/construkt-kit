import { dialog } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import { createDialogParts } from "../dialogParts";

export type { DialogContentProps } from "../dialogParts";

export const Dialog = createDialogParts(dialog);

export type DialogRootProps = ComponentProps<typeof Dialog.Root>;
