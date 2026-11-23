import {
  type ComponentProps,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type DrawerVariantProps, drawer } from "#styled-system/recipes";

import { isRtl } from "../../foundations/dom";
import { getMediaQueryList } from "../../hooks/mediaQueryList";
import { useControllableState } from "../../hooks/useControllableState";
import { useResponsiveValue } from "../../hooks/useResponsiveValue";
import type { SwipeDirection } from "../../primitives/drag";
import { findMarkedFocus } from "../../primitives/focus";
import { renderable } from "../../primitives/render";
import {
  type DialogContentProps,
  type ModalRootProps,
  type ModalSurface,
  type ModalSurfaceProps,
  ModalRoot,
  createDialogParts,
} from "../dialogParts";
import { createPartContext } from "../partContext";
import { type DrawerSnapPoint, useDrawerSwipe } from "./drawerSwipe";

export type { DrawerSnapPoint };

export interface DrawerSnapProps {
  /** Heights a top or bottom drawer rests at; a swipe settles on the one it points at. */
  snapPoints?: readonly DrawerSnapPoint[] | undefined;
  snapPoint?: DrawerSnapPoint | undefined;
  /** @default the first of `snapPoints` */
  defaultSnapPoint?: DrawerSnapPoint | undefined;
  onSnapPointChange?: ((snapPoint: DrawerSnapPoint) => void) | undefined;
}

const PHYSICAL = {
  ltr: { start: "left", end: "right", top: "up", bottom: "down" },
  rtl: { start: "right", end: "left", top: "up", bottom: "down" },
} as const;

type Edge = keyof (typeof PHYSICAL)["ltr"];

const isEdge = (value: unknown): value is Edge =>
  typeof value === "string" && value in PHYSICAL.ltr;

interface DrawerContextValue {
  edge: Edge;
  snapPoints: readonly DrawerSnapPoint[] | undefined;
  snapPoint: DrawerSnapPoint | null;
  setSnapPoint: (point: DrawerSnapPoint) => void;
  resetSnapPoint: () => void;
}

const [DrawerContext, useDrawerContext] = createPartContext<DrawerContextValue>(
  "<Drawer.Root>",
  "Drawer parts",
);

type GrabberHandlers = { onPointerDown: (event: PointerEvent<HTMLElement>) => void };

const GrabberContext = createContext<GrabberHandlers | null>(null);

const { withRootProvider, withContext } = createSlotRecipeContext(drawer);

// A field focused on open raises the on-screen keyboard over the drawer.
const focusDialogOnTouch = (dialog: HTMLElement) =>
  getMediaQueryList("(pointer: coarse)")?.matches ? (findMarkedFocus(dialog) ?? dialog) : null;

interface DrawerRootBaseProps extends ModalRootProps, DrawerSnapProps {
  edge: Edge;
}

function DrawerRootBase({
  edge,
  snapPoints,
  snapPoint: snapPointProp,
  defaultSnapPoint,
  onSnapPointChange,
  initialFocusEl = focusDialogOnTouch,
  ...props
}: DrawerRootBaseProps) {
  const [snapPoint, setSnapPoint, resetSnapPoint] = useControllableState<DrawerSnapPoint | null>({
    value: snapPointProp,
    defaultValue: defaultSnapPoint ?? snapPoints?.[0] ?? null,
    onChange: (point) => {
      if (point !== null) onSnapPointChange?.(point);
    },
  });
  const value = useMemo(
    () => ({ edge, snapPoints, snapPoint, setSnapPoint, resetSnapPoint }),
    [edge, snapPoints, snapPoint, setSnapPoint, resetSnapPoint],
  );

  return (
    <DrawerContext value={value}>
      <ModalRoot
        initialFocusEl={initialFocusEl}
        {...props}
      />
    </DrawerContext>
  );
}

const StyledRoot = withRootProvider(DrawerRootBase);

function useEdge(placement: DrawerVariantProps["placement"]): Edge {
  const current = useResponsiveValue(placement);
  return isEdge(current) ? current : "end";
}

/** The way a drawer swipes away: towards the side its edge lies on in the dialog's direction. */
const swipeDirection = (edge: Edge, dialog: HTMLElement | null): SwipeDirection =>
  PHYSICAL[dialog !== null && isRtl(dialog) ? "rtl" : "ltr"][edge];

export type DrawerRootInternalProps = Omit<DrawerRootBaseProps, "edge"> & DrawerVariantProps;

/** The drawer root: `Drawer.Root` and `Sheet.Root` require a name; a phone sheet's frame takes its overlay's. */
export function DrawerRoot({ placement = "end", ...props }: DrawerRootInternalProps) {
  return (
    <StyledRoot
      placement={placement}
      edge={useEdge(placement)}
      {...props}
    />
  );
}

function useDrawerSurface(
  surface: ModalSurface,
  { draggable }: DialogContentProps,
): ModalSurfaceProps {
  const drawerContext = useDrawerContext();
  const swipe = useDrawerSwipe({
    surface,
    direction: swipeDirection(drawerContext.edge, surface.dialog),
    snapPoints: drawerContext.snapPoints,
    snapPoint: drawerContext.snapPoint,
    setSnapPoint: drawerContext.setSnapPoint,
    resetSnapPoint: drawerContext.resetSnapPoint,
    draggable,
  });
  return {
    contentProps: { ...swipe.contentProps, draggable: false },
    wrapChildren: (children: ReactNode) => (
      <GrabberContext value={swipe.grabberProps}>{children}</GrabberContext>
    ),
  };
}

const parts = createDialogParts(withContext, { useSurface: useDrawerSurface });

const StyledGrabber = withContext(renderable.div, "grabber");

function Grabber({ onPointerDown, ...props }: ComponentProps<typeof StyledGrabber>): ReactElement {
  const handlers = useContext(GrabberContext);
  return (
    <StyledGrabber
      {...props}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) handlers?.onPointerDown(event);
      }}
    />
  );
}

const GrabberIndicator = withContext(renderable.div, "grabberIndicator");

export const drawerParts = { ...parts, Grabber, GrabberIndicator };
