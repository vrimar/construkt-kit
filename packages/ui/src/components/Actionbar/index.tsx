import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover } from "@ark-ui/react/popover";
import { usePresenceContext } from "@ark-ui/react/presence";
import type { ComponentProps, ComponentType } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { actionbar } from "#styled-system/recipes";

import type { PortalledProps } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { Popover } from "../Popover";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(actionbar);

const StyledRoot = withRootProvider(Popover.Root, {
  defaultProps: { closeOnInteractOutside: false, autoFocus: false },
});
const StyledPositioner = withContext(ark.div, "positioner");
const Content = withContext(ArkPopover.Content, "content", {
  defaultProps: { role: "region", "aria-label": "Selection actions" },
});
const Separator = withContext(ark.div, "separator");
const SelectionTrigger = withContext(ark.button, "selectionTrigger");
const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");

function Positioner(props: ComponentProps<typeof StyledPositioner>) {
  const presence = usePresenceContext();
  if (presence.unmounted) return null;
  return <StyledPositioner {...props} />;
}

export type ActionBarRootProps = Omit<
  ComponentProps<typeof StyledRoot>,
  "placement" | "positioning"
>;

const Root = StyledRoot as ComponentType<ActionBarRootProps>;

export interface ActionBarContentProps extends ComponentProps<typeof Content>, PortalledProps {}

export const ActionBar = {
  Root,
  Content: createPortalledContent(Positioner, Content),
  Separator,
  SelectionTrigger,
  CloseTrigger: createCloseTrigger(CloseTrigger),
};
