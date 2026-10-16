import { Dialog as ArkDialog, DialogContext, useDialogContext } from "@ark-ui/react/dialog";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { dialog } from "#styled-system/recipes";

import { createDialogParts } from "../dialogParts";
import { lazyOverlayDefaults } from "../overlayDefaults";

export type { DialogContentProps } from "../dialogParts";

const { withRootProvider, withContext } = createSlotRecipeContext(dialog);

export const Dialog = {
  Root: withRootProvider(ArkDialog.Root, { defaultProps: lazyOverlayDefaults }),
  RootProvider: withRootProvider(ArkDialog.RootProvider, { defaultProps: lazyOverlayDefaults }),
  ...createDialogParts(withContext, ArkDialog, { useApi: useDialogContext }),
  Context: DialogContext,
};

export type DialogRootProps = ComponentProps<typeof Dialog.Root>;
