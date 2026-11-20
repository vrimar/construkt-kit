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

import { getMediaQueryList } from "../../hooks/mediaQueryList";
import { useControllableState } from "../../hooks/useControllableState";
import { useResponsiveValue } from "../../hooks/useResponsiveValue";
import { useLocale } from "../../primitives/locale";
import { renderable } from "../../primitives/render";
import {
  type DialogContentProps,
  type ModalRootProps,
  type ModalSurface,
  type ModalSurfaceProps,
  ModalRoot,
  createDialogParts,
} from "../dialogParts";
import { type DrawerSnapPoint, type SwipeDirection, useDrawerSwipe } from "./drawerSwipe";

export type { DrawerSnapPoint };

export interface DrawerSnapProps {
  /** Heights a top or bottom drawer rests at; a swipe settles on the one it points at. */
  snapPoints?: readonly DrawerSnapPoint[] | undefined;
  snapPoint?: DrawerSnapPoint | undefined;
  /** @default the first of `snapPoints` */
  defaultSnapPoint?: DrawerSnapPoint | undefined;
  onSnapPointChange?: ((snapPoint: DrawerSnapPoint) => void) | undefined;
}

interface DrawerContextValue {
  direction: SwipeDirection;
  snapPoints: readonly DrawerSnapPoint[] | undefined;
  snapPoint: DrawerSnapPoint | null;
  setSnapPoint: (point: DrawerSnapPoint) => void;
  resetSnapPoint: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

type GrabberHandlers = { onPointerDown: (event: PointerEvent<HTMLElement>) => void };

const GrabberContext = createContext<GrabberHandlers | null>(null);

const { withRootProvider, withContext } = createSlotRecipeContext(drawer);

// A field focused on open raises the on-screen keyboard over the drawer.
const focusDialogOnTouch = (dialog: HTMLElement) =>
  getMediaQueryList("(pointer: coarse)")?.matches
    ? (dialog.querySelector<HTMLElement>("[data-autofocus],[autofocus]") ?? dialog)
    : null;

interface DrawerRootBaseProps extends ModalRootProps, DrawerSnapProps {
  swipeDirection: SwipeDirection;
}

function DrawerRootBase({
  swipeDirection,
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
    () => ({ direction: swipeDirection, snapPoints, snapPoint, setSnapPoint, resetSnapPoint }),
    [swipeDirection, snapPoints, snapPoint, setSnapPoint, resetSnapPoint],
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

const PHYSICAL = {
  ltr: { start: "left", end: "right", top: "up", bottom: "down" },
  rtl: { start: "right", end: "left", top: "up", bottom: "down" },
} as const;

const isPlacement = (value: unknown): value is keyof (typeof PHYSICAL)["ltr"] =>
  typeof value === "string" && value in PHYSICAL.ltr;

/** The way a drawer swipes away: towards the side its placement at the current breakpoint opens from. */
function useSwipeDirection(placement: DrawerVariantProps["placement"]): SwipeDirection {
  const current = useResponsiveValue(placement);
  return PHYSICAL[useLocale().dir][isPlacement(current) ? current : "end"];
}

export type DrawerRootInternalProps = Omit<DrawerRootBaseProps, "swipeDirection"> &
  DrawerVariantProps;

/** The drawer root: `Drawer.Root` and `Sheet.Root` require a name; a phone sheet's frame takes its overlay's. */
export function DrawerRoot({ placement = "end", ...props }: DrawerRootInternalProps) {
  return (
    <StyledRoot
      placement={placement}
      swipeDirection={useSwipeDirection(placement)}
      {...props}
    />
  );
}

function useDrawerSurface(
  surface: ModalSurface,
  { draggable }: DialogContentProps,
): ModalSurfaceProps {
  const drawerContext = useContext(DrawerContext);
  if (!drawerContext) throw new Error("Drawer parts must be rendered inside Drawer.Root.");
  const swipe = useDrawerSwipe({
    surface,
    direction: drawerContext.direction,
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
