import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover } from "@ark-ui/react/popover";
import { usePresenceContext } from "@ark-ui/react/presence";
import { type ComponentProps, createContext, useContext } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { actionbar } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(actionbar);

const StyledRoot = withRootProvider(ArkPopover.Root, {
  defaultProps: { ...lazyOverlayDefaults, closeOnInteractOutside: false, autoFocus: false },
});
const StyledPositioner = withContext(ark.div, "positioner");
const Content = withContext(ArkPopover.Content, "content", {
  defaultProps: { role: "region", "aria-label": "Selection actions" },
});
const Separator = withContext(ark.div, "separator");
const SelectionTrigger = withContext(ark.button, "selectionTrigger");
const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");
const Lead = withContext(ark.div, "lead");
const Scope = withContext(ark.span, "scope");

function Positioner(props: ComponentProps<typeof StyledPositioner>) {
  const presence = usePresenceContext();
  if (presence.unmounted) return null;
  return <StyledPositioner {...props} />;
}

type ActionBarPlacement = "bottom" | "inline";

const PlacementContext = createContext<ActionBarPlacement>("bottom");

export interface ActionBarRootProps extends Omit<
  ComponentProps<typeof StyledRoot>,
  "placement" | "positioning"
> {
  /**
   * `bottom` floats the bar at the bottom centre of the viewport. `inline` renders it in place,
   * covering its nearest positioned ancestor, such as a table's header band.
   */
  placement?: ActionBarPlacement | undefined;
}

function Root({ placement = "bottom", ...props }: ActionBarRootProps) {
  return (
    <PlacementContext.Provider value={placement}>
      <StyledRoot
        placement={placement}
        {...props}
      />
    </PlacementContext.Provider>
  );
}

export interface ActionBarContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const PortalledContent = createPortalledContent(Positioner, Content);

/** Portalled at the `bottom` placement and rendered in place at `inline`, unless `portalled` says otherwise. */
function ActionBarContent({ portalled, ...props }: WithRef<ActionBarContentProps>) {
  const placement = useContext(PlacementContext);
  return (
    <PortalledContent
      portalled={portalled ?? placement === "bottom"}
      {...props}
    />
  );
}

export const ActionBar = {
  Root,
  Content: ActionBarContent,
  Separator,
  SelectionTrigger,
  CloseTrigger: createCloseTrigger(CloseTrigger),
  Lead,
  Scope,
};
