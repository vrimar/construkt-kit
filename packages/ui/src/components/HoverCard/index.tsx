import {
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { hoverCard } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type DismissReason,
  type OpenChangeReason,
  type UseOpenStateOptions,
  useOpenState,
} from "../../primitives/layer";
import type { PlacementOption } from "../../primitives/position";
import { presenceAttributes } from "../../primitives/presence";
import { mergeProps, openStateAttributes, renderable } from "../../primitives/render";
import { createAnchoredPositioner, createArrow, useAnchoredPopup } from "../floating";
import { createPartContext } from "../partContext";
import { HOVER_CARD_CLOSE_DELAY, HOVER_CARD_OPEN_DELAY } from "./hoverCardDelays";

const { withRootProvider, withContext } = createSlotRecipeContext(hoverCard);

const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledContent = withContext(renderable.div, "content");
const Positioner = createAnchoredPositioner(withContext(renderable.div, "positioner"));
const StyledTrigger = withContext(renderable.button, "trigger");
const floatingArrow = createArrow(StyledArrow, StyledArrowTip);
const Arrow: (props: ComponentProps<typeof StyledArrow>) => ReactNode = floatingArrow.Arrow;
const ArrowTip: (props: ComponentProps<typeof StyledArrowTip>) => ReactNode =
  floatingArrow.ArrowTip;

interface HoverCardContextValue {
  open: boolean;
  placement: PlacementOption;
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => void;
  openSoon: (reason: OpenChangeReason, event: Event) => void;
  closeSoon: (event: Event) => void;
  setPointer: (inside: boolean) => void;
  pointerInside: () => boolean;
}

const [HoverCardContext, useHoverCardContext] = createPartContext<HoverCardContextValue>(
  "<HoverCard.Root>",
  "HoverCard parts",
);

export interface HoverCardRootProps extends UseOpenStateOptions {
  children?: ReactNode;
  disabled?: boolean | undefined;
  /** @default 600 */
  openDelay?: number | undefined;
  /** @default 300 */
  closeDelay?: number | undefined;
  /** @default "bottom" */
  placement?: PlacementOption | undefined;
}

function Root({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled = false,
  openDelay = HOVER_CARD_OPEN_DELAY,
  closeDelay = HOVER_CARD_CLOSE_DELAY,
  placement = "bottom",
}: HoverCardRootProps) {
  const state = useOpenState({ open: openProp, defaultOpen, onOpenChange });
  const { open } = state;
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pointerRef = useRef(false);
  const latest = useLatestRef({
    open,
    disabled,
    openDelay,
    closeDelay,
    requestState: state.requestOpenChange,
  });

  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      clearTimeout(timer.current);
      if (next && latest.current.disabled) return;
      latest.current.requestState(next, reason, event);
    },
    [latest],
  );

  const openSoon = useCallback(
    (reason: OpenChangeReason, event: Event) => {
      clearTimeout(timer.current);
      if (latest.current.open || latest.current.disabled) return;
      timer.current = setTimeout(
        () => requestOpenChange(true, reason, event),
        latest.current.openDelay,
      );
    },
    [latest, requestOpenChange],
  );

  const closeSoon = useCallback(
    (event: Event) => {
      clearTimeout(timer.current);
      if (!latest.current.open) return;
      timer.current = setTimeout(
        () => requestOpenChange(false, "pointer-leave", event),
        latest.current.closeDelay,
      );
    },
    [latest, requestOpenChange],
  );

  useEffect(() => {
    if (disabled) requestOpenChange(false, "trigger-blur");
  }, [disabled, requestOpenChange]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const setPointer = useCallback((inside: boolean) => {
    pointerRef.current = inside;
  }, []);
  const pointerInside = useCallback(() => pointerRef.current, []);

  const value = useMemo(
    () => ({
      open,
      placement,
      triggerEl,
      setTriggerEl,
      requestOpenChange,
      openSoon,
      closeSoon,
      setPointer,
      pointerInside,
    }),
    [open, placement, triggerEl, requestOpenChange, openSoon, closeSoon, setPointer, pointerInside],
  );

  return <HoverCardContext value={value}>{children}</HoverCardContext>;
}

const HoverCardRoot = withRootProvider(Root);

const hoverHandlers = (context: HoverCardContextValue) => ({
  onPointerEnter: (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    context.setPointer(true);
    context.openSoon("trigger-hover", event.nativeEvent);
  },
  onPointerLeave: (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    context.setPointer(false);
    context.closeSoon(event.nativeEvent);
  },
});

function Trigger({ ref, onFocus, onBlur, ...props }: ComponentProps<typeof StyledTrigger>) {
  const context = useHoverCardContext();
  const composedRef = useComposedRefs(ref, context.setTriggerEl);
  return (
    <StyledTrigger
      type={props.render ? undefined : "button"}
      {...openStateAttributes(context.open)}
      {...mergeProps<ComponentProps<typeof StyledTrigger>>(hoverHandlers(context), props)}
      ref={composedRef}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.currentTarget.matches(":focus-visible")) {
          context.openSoon("trigger-focus", event.nativeEvent);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!context.pointerInside()) context.requestOpenChange(false, "trigger-blur");
      }}
    />
  );
}

export type HoverCardContentProps = ComponentProps<typeof StyledContent>;

function Content({ ref, ...props }: HoverCardContentProps) {
  const context = useHoverCardContext();
  const { open, requestOpenChange } = context;
  const popup = useAnchoredPopup({
    open,
    placement: context.placement,
    anchor: context.triggerEl,
    trigger: context.triggerEl,
    overlay: false,
    dismiss: (reason: DismissReason, event: Event) => {
      if (reason === "focus-out") return false;
      requestOpenChange(false, reason, event);
      return true;
    },
  });
  const elementRef = useComposedRefs(ref, popup.setElement);

  if (!popup.mounted) return null;

  return (
    <Positioner popup={popup}>
      <StyledContent
        tabIndex={-1}
        data-side={popup.side}
        data-align={popup.align}
        {...presenceAttributes(popup.status)}
        {...openStateAttributes(open)}
        {...mergeProps<HoverCardContentProps>(hoverHandlers(context), props)}
        ref={elementRef}
      />
    </Positioner>
  );
}

export const HoverCard = {
  Root: HoverCardRoot,
  Arrow,
  ArrowTip,
  Content,
  Trigger,
};
