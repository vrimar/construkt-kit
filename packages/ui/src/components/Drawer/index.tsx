import {
  Drawer as ArkDrawer,
  DrawerContext,
  type UseDrawerProps as ArkUseDrawerProps,
  type UseDrawerReturn,
  useDrawer as useArkDrawer,
  useDrawerContext,
} from "@ark-ui/react/drawer";
import { type ComponentProps, type PointerEvent, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type DrawerVariantProps, drawer } from "#styled-system/recipes";

import { getMediaQueryList } from "../../hooks/mediaQueryList";
import { useResponsiveValue } from "../../hooks/useResponsiveValue";
import { type DialogContentProps, createDialogParts } from "../dialogParts";
import { lazyOverlayDefaults } from "../overlayDefaults";

export type DrawerContentProps = DialogContentProps;

function useDrawerContentProps({ draggable, onPointerDown }: DialogContentProps) {
  const api = useDrawerContext();
  const startDrag = api.getContentProps({
    draggable: draggable === undefined || String(draggable) === "true",
  }).onPointerDown;

  return {
    draggable: false,
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      onPointerDown?.(event);
      // A mouse drag over content selects text; by default the mouse swipes from the grabber.
      if (draggable === undefined && event.pointerType === "mouse") return;
      // Pointerdowns in portalled overlays opened from inside bubble here through React.
      if (event.target instanceof Node && event.currentTarget.contains(event.target)) {
        startDrag?.(event);
      }
    },
  };
}

const { withRootProvider, withContext } = createSlotRecipeContext(drawer);

const StyledRoot = withRootProvider(ArkDrawer.Root, { defaultProps: lazyOverlayDefaults });

const StyledRootProvider = withRootProvider(ArkDrawer.RootProvider, {
  defaultProps: lazyOverlayDefaults,
});

const SWIPE_DIRECTION = { start: "start", end: "end", top: "up", bottom: "down" } as const;

const PLACEMENT = { start: "start", end: "end", up: "top", down: "bottom" } as const;

const isPlacement = (value: unknown): value is keyof typeof SWIPE_DIRECTION =>
  typeof value === "string" && value in SWIPE_DIRECTION;

const useSwipeDirection = (placement: DrawerVariantProps["placement"]) => {
  const currentPlacement = useResponsiveValue(placement);
  return isPlacement(currentPlacement) ? SWIPE_DIRECTION[currentPlacement] : undefined;
};

type FocusProps = Pick<ArkUseDrawerProps, "ids" | "initialFocusEl">;

// A field focused on open raises the on-screen keyboard over the drawer.
function useTouchInitialFocus({ ids, initialFocusEl }: FocusProps): FocusProps {
  const generatedId = useId();
  const contentId = ids?.content ?? `drawer:${generatedId}:content`;

  const focusContentOnTouch = () => {
    if (!getMediaQueryList("(pointer: coarse)")?.matches) return null;
    const content = document.getElementById(contentId);
    return content?.querySelector<HTMLElement>("[data-autofocus],[autofocus]") ?? content;
  };

  return {
    ids: { ...ids, content: contentId },
    initialFocusEl: initialFocusEl ?? focusContentOnTouch,
  };
}

export type DrawerRootProps = ComponentProps<typeof StyledRoot>;

function DrawerRoot({ placement = "end", ids, initialFocusEl, ...props }: DrawerRootProps) {
  const swipeDirection = useSwipeDirection(placement);
  const focusProps = useTouchInitialFocus({ ids, initialFocusEl });

  return (
    <StyledRoot
      placement={placement}
      swipeDirection={swipeDirection}
      {...focusProps}
      {...props}
    />
  );
}

export interface UseDrawerProps extends Omit<ArkUseDrawerProps, "swipeDirection"> {
  /** The side the drawer opens from; it swipes away towards the same side. @default "end" */
  placement?: DrawerVariantProps["placement"];
}

export type { UseDrawerReturn };

/** `useDrawer` for `Drawer.RootProvider`, which takes its placement from the returned value. */
export function useDrawer({ placement = "end", ...props }: UseDrawerProps = {}): UseDrawerReturn {
  const swipeDirection = useSwipeDirection(placement);
  const focusProps = useTouchInitialFocus(props);
  return useArkDrawer({ ...props, ...focusProps, swipeDirection });
}

export type DrawerRootProviderProps = Omit<ComponentProps<typeof StyledRootProvider>, "placement">;

function DrawerRootProvider(props: DrawerRootProviderProps) {
  return (
    <StyledRootProvider
      placement={PLACEMENT[props.value.swipeDirection]}
      {...props}
    />
  );
}

export const Drawer = {
  Root: DrawerRoot,
  RootProvider: DrawerRootProvider,
  ...createDialogParts(withContext, ArkDrawer, {
    useApi: useDrawerContext,
    useContentProps: useDrawerContentProps,
  }),
  Grabber: withContext(ArkDrawer.Grabber, "grabber"),
  GrabberIndicator: withContext(ArkDrawer.GrabberIndicator, "grabberIndicator"),
  SwipeArea: withContext(ArkDrawer.SwipeArea, "swipeArea"),
  Context: DrawerContext,
};
