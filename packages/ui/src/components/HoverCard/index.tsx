import {
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { hoverCard } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type DismissReason,
  LayerContext,
  type OpenChangeDetails,
  type OpenChangeReason,
  createOpenChangeDetails,
  useLayer,
} from "../../primitives/layer";
import { type PlacementOption, usePosition } from "../../primitives/position";
import { presenceAttributes, usePresence } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import type { WithRef } from "../../types";
import { FloatingContext, createArrow, createTopLayerPositioner } from "../floating";

const { withRootProvider, withContext } = createSlotRecipeContext(hoverCard);

const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledContent = withContext(renderable.div, "content");
const Positioner = createTopLayerPositioner(withContext(renderable.div, "positioner"));
const StyledTrigger = withContext(renderable.button, "trigger");
const floatingArrow = createArrow(StyledArrow, StyledArrowTip);
const Arrow: (props: WithRef<ComponentProps<typeof StyledArrow>>) => ReactNode =
  floatingArrow.Arrow;
const ArrowTip: (props: ComponentProps<typeof StyledArrowTip>) => ReactNode =
  floatingArrow.ArrowTip;

interface HoverCardContextValue {
  open: boolean;
  contentId: string;
  placement: PlacementOption;
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => void;
  openSoon: (reason: OpenChangeReason, event: Event) => void;
  closeSoon: (event: Event) => void;
  setPointer: (inside: boolean) => void;
  pointerInside: () => boolean;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

const useHoverCardContext = () => {
  const context = useContext(HoverCardContext);
  if (!context) throw new Error("HoverCard parts must be rendered inside HoverCard.Root.");
  return context;
};

export interface HoverCardRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
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
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  openDelay = 600,
  closeDelay = 300,
  placement = "bottom",
}: HoverCardRootProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen });
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const contentId = `hover-card:${useId()}:content`;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pointerRef = useRef(false);
  const latest = useLatestRef({ open, disabled, onOpenChange, openDelay, closeDelay });

  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      clearTimeout(timer.current);
      if (next === latest.current.open || (next && latest.current.disabled)) return;
      const details = createOpenChangeDetails(reason, event);
      latest.current.onOpenChange?.(next, details);
      if (!details.canceled) setOpen(next);
    },
    [latest, setOpen],
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
      contentId,
      placement,
      triggerEl,
      setTriggerEl,
      requestOpenChange,
      openSoon,
      closeSoon,
      setPointer,
      pointerInside,
    }),
    [
      open,
      contentId,
      placement,
      triggerEl,
      requestOpenChange,
      openSoon,
      closeSoon,
      setPointer,
      pointerInside,
    ],
  );

  return <HoverCardContext value={value}>{children}</HoverCardContext>;
}

const HoverCardRoot = withRootProvider(Root);

function Trigger({
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: WithRef<ComponentProps<typeof StyledTrigger>, HTMLButtonElement>) {
  const context = useHoverCardContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setTriggerEl);
  return (
    <StyledTrigger
      type={props.render ? undefined : "button"}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
      onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType === "touch") return;
        context.setPointer(true);
        context.openSoon("trigger-hover", event.nativeEvent);
      }}
      onPointerLeave={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(event);
        if (event.pointerType === "touch") return;
        context.setPointer(false);
        context.closeSoon(event.nativeEvent);
      }}
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

function Content({
  ref,
  onPointerEnter,
  onPointerLeave,
  ...props
}: WithRef<HoverCardContentProps>) {
  const context = useHoverCardContext();
  const { open, requestOpenChange } = context;
  const position = usePosition({ open, placement: context.placement, anchor: context.triggerEl });
  const presence = usePresence(open);
  const positionerRef = useRef<HTMLElement | null>(null);
  const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, presence.setElement);
  const floatingRef = useComposedRefs(positionerRef, position.setFloating);

  const layer = useLayer(open, {
    contains: (target) =>
      (positionerRef.current?.contains(target) ?? false) ||
      (context.triggerEl?.contains(target) ?? false),
    dismiss: (reason: DismissReason, event: Event) => {
      if (reason === "focus-out") return false;
      requestOpenChange(false, reason, event);
      return true;
    },
  });

  if (!presence.mounted) return null;

  return (
    <FloatingContext
      value={{
        side: position.side,
        align: position.align,
        arrowStyle: position.arrowStyle,
        setArrow: position.setArrow,
      }}
    >
      <LayerContext value={layer}>
        <Positioner
          ref={floatingRef}
          style={position.floatingStyle}
          data-side={position.side}
          data-align={position.align}
        >
          <StyledContent
            id={context.contentId}
            tabIndex={-1}
            data-side={position.side}
            data-align={position.align}
            {...presenceAttributes(presence.status)}
            {...openStateAttributes(open)}
            {...props}
            ref={elementRef}
            onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
              onPointerEnter?.(event);
              if (event.pointerType === "touch") return;
              context.setPointer(true);
              context.openSoon("trigger-hover", event.nativeEvent);
            }}
            onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
              onPointerLeave?.(event);
              if (event.pointerType === "touch") return;
              context.setPointer(false);
              context.closeSoon(event.nativeEvent);
            }}
          />
        </Positioner>
      </LayerContext>
    </FloatingContext>
  );
}

export const HoverCard = {
  Root: HoverCardRoot,
  Arrow,
  ArrowTip,
  Content,
  Trigger,
};
