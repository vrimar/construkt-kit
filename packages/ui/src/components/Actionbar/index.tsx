import { type ComponentProps, type MouseEvent, type ReactNode, useMemo } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { actionbar } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import {
  type OpenChangeReason,
  type UseOpenStateOptions,
  useEscapeFallback,
  useOpenState,
} from "../../primitives/layer";
import { usePresence } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import type { PortalledProps } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { createPartContext } from "../partContext";
import { Portal } from "../Portal";

const { withProvider, withContext } = createSlotRecipeContext(actionbar);

const Positioner = withProvider(renderable.div, "positioner");
const StyledContent = withContext(renderable.div, "content");
const Separator = withContext(renderable.div, "separator");
const SelectionTrigger = withContext(renderable.button, "selectionTrigger");
const StyledCloseTrigger = withContext(renderable.button, "closeTrigger");
const Lead = withContext(renderable.div, "lead");
const Scope = withContext(renderable.span, "scope");

type ActionBarPlacement = "bottom" | "inline";

interface ActionBarContextValue {
  open: boolean;
  placement: ActionBarPlacement;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
}

const [ActionBarContext, useActionBarContext] = createPartContext<ActionBarContextValue>(
  "<ActionBar.Root>",
  "ActionBar parts",
);

export interface ActionBarRootProps extends UseOpenStateOptions {
  children?: ReactNode;
  /** @default true */
  closeOnEscape?: boolean | undefined;
  /**
   * `bottom` floats the bar at the bottom centre of the viewport. `inline` renders it in place,
   * covering its nearest positioned ancestor, such as a table's header band.
   */
  placement?: ActionBarPlacement | undefined;
}

function Root({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  closeOnEscape = true,
  placement = "bottom",
}: ActionBarRootProps) {
  const { open, requestOpenChange } = useOpenState({ open: openProp, defaultOpen, onOpenChange });

  useEscapeFallback(open && closeOnEscape, (event) => {
    requestOpenChange(false, "escape-key", event);
    return true;
  });

  const value = useMemo(
    () => ({ open, placement, requestOpenChange }),
    [open, placement, requestOpenChange],
  );
  return <ActionBarContext value={value}>{children}</ActionBarContext>;
}

export interface ActionBarContentProps
  extends ComponentProps<typeof StyledContent>, PortalledProps {}

/** Portalled at the `bottom` placement and rendered in place at `inline`, unless `portalled` says otherwise. */
function Content({ ref, portalled, portalRef, ...props }: ActionBarContentProps) {
  const { open, placement } = useActionBarContext();
  const presence = usePresence(open);
  const contentRef = useComposedRefs(ref, presence.setElement);
  const portal = portalled ?? placement === "bottom";
  if (!presence.mounted) return null;

  const bar = (
    <Positioner placement={placement}>
      <StyledContent
        role="region"
        aria-label="Selection actions"
        {...openStateAttributes(open)}
        {...props}
        ref={contentRef}
      />
    </Positioner>
  );
  return (
    <Portal
      target={portalRef}
      disabled={!portal}
    >
      {bar}
    </Portal>
  );
}

function useCloseActionBar() {
  const { requestOpenChange } = useActionBarContext();
  return (event: MouseEvent<HTMLElement>) =>
    requestOpenChange(false, "close-press", event.nativeEvent);
}

export const ActionBar = {
  Root,
  Content,
  Separator,
  SelectionTrigger,
  CloseTrigger: createCloseTrigger(StyledCloseTrigger, useCloseActionBar),
  Lead,
  Scope,
};
