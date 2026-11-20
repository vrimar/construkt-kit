import type { ReactElement } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type DialogVariantProps, dialog } from "#styled-system/recipes";

import {
  type DialogContentProps,
  type DialogLabelProps,
  type DialogRootBaseProps,
  ModalRoot,
  createDialogParts,
} from "../dialogParts";

export type { DialogContentProps };

const { withRootProvider, withContext } = createSlotRecipeContext(dialog);

const parts = createDialogParts(withContext);

/** `Dialog.Root` props other than its name, for components that wrap it and name it themselves. */
export type DialogRootOwnProps = DialogRootBaseProps & DialogVariantProps;

export type DialogRootProps = DialogRootOwnProps & DialogLabelProps;

const Root: (props: DialogRootProps) => ReactElement = withRootProvider(ModalRoot);

export const Dialog = {
  Root,
  Trigger: parts.Trigger,
  Content: parts.Content,
  Header: parts.Header,
  Title: parts.Title,
  Description: parts.Description,
  Body: parts.Body,
  Footer: parts.Footer,
  CloseTrigger: parts.CloseTrigger,
  ActionTrigger: parts.ActionTrigger,
};
