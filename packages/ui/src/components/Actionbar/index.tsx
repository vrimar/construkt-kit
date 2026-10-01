import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover } from "@ark-ui/react/popover";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { actionbar } from "#styled-system/recipes";

import type { PortalledProps } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { Popover } from "../Popover";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(actionbar);

const Root = withRootProvider(Popover.Root);
const Content = withContext(ark.div, "content");
const Separator = withContext(ark.div, "separator");
const SelectionTrigger = withContext(ark.button, "selectionTrigger");
const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");

export type ActionBarRootProps = ComponentProps<typeof Root>;

export interface ActionBarContentProps extends ComponentProps<typeof Content>, PortalledProps {}

export const ActionBar = {
  Root,
  Content: createPortalledContent(Popover.Positioner, Content),
  Separator,
  SelectionTrigger,
  CloseTrigger: createCloseTrigger(CloseTrigger),
};
