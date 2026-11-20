import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { actionbar } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import {
  type OpenChangeDetails,
  type OpenChangeReason,
  createOpenChangeDetails,
  useEscapeFallback,
} from "../../primitives/layer";
import { usePresence } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import type { PortalledProps, WithRef } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
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
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => void;
}

const ActionBarContext = createContext<ActionBarContextValue | null>(null);

const useActionBarContext = () => {
  const context = useContext(ActionBarContext);
  if (!context) throw new Error("ActionBar parts must be rendered inside ActionBar.Root.");
  return context;
};

export interface ActionBarRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
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
  defaultOpen = false,
  onOpenChange,
  closeOnEscape = true,
  placement = "bottom",
}: ActionBarRootProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen });

  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      const details = createOpenChangeDetails(reason, event);
      onOpenChange?.(next, details);
      if (!details.canceled) setOpen(next);
    },
    [onOpenChange, setOpen],
  );

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
function Content({ ref, portalled, portalRef, ...props }: WithRef<ActionBarContentProps>) {
  const { open, placement } = useActionBarContext();
  const presence = usePresence(open);
  const contentRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, presence.setElement);
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

function CloseTriggerPart({ onClick, ...props }: ComponentProps<typeof StyledCloseTrigger>) {
  const { requestOpenChange } = useActionBarContext();
  return (
    <StyledCloseTrigger
      type="button"
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) requestOpenChange(false, "close-press", event.nativeEvent);
      }}
    />
  );
}

export const ActionBar = {
  Root,
  Content,
  Separator,
  SelectionTrigger,
  CloseTrigger: createCloseTrigger(CloseTriggerPart),
  Lead,
  Scope,
};
