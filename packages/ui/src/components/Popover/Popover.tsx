import {
  type ComponentProps,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { popover } from "#styled-system/recipes";

import { isSafari } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { closeFocusIntent, dismissFocusIntent } from "../../primitives/focus";
import {
  type DismissReason,
  type OpenChangeDetails,
  type OpenChangeReason,
  useOpenState,
  useOverlayExit,
} from "../../primitives/layer";
import type { Anchor, PlacementOption } from "../../primitives/position";
import { type TransitionStatus, presenceAttributes } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import type { WithRef } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import {
  createAnchoredPositioner,
  createArrow,
  getPopupTriggerProps,
  useAnchoredPopup,
} from "../floating";
import {
  type MobileLayoutProps,
  OverlayPresentationContext,
  useOverlayMode,
  useOverlayPresentation,
  usePresentedOverlayFocus,
} from "../overlayPresentation";
import { type SheetCloseReason, SheetOverlayContent, splitSheetLabel } from "../sheetFrame";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createSlotRecipeContext(popover);

const StyledAnchor = withContext(renderable.div, "anchor");
const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledCloseTrigger = withContext(renderable.button, "closeTrigger");
const StyledContent = withContext(renderable.div, "content");
const StyledDescription = withContext(renderable.div, "description");
const StyledIndicator = withContext(renderable.div, "indicator");
const Positioner = createAnchoredPositioner(withContext(renderable.div, "positioner"));
const StyledTitle = withContext(renderable.h2, "title");
const StyledTrigger = withContext(renderable.button, "trigger");

const Body = withContext(renderable.div, "body");
const Header = withContext(renderable.div, "header");
const StyledFooter = withContext(renderable.div, "footer");

const floatingArrow = createArrow(StyledArrow, StyledArrowTip);
const Arrow: (props: WithRef<ComponentProps<typeof StyledArrow>>) => ReactNode =
  floatingArrow.Arrow;
const ArrowTip: (props: ComponentProps<typeof StyledArrowTip>) => ReactNode =
  floatingArrow.ArrowTip;

type LabelPart = "title" | "description";

interface PopoverContextValue {
  open: boolean;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
  ids: { trigger: string; content: string; title: string; description: string };
  placement: PlacementOption;
  anchor: Anchor | null;
  gutter: number | undefined;
  dismiss: (reason: DismissReason | SheetCloseReason, event?: Event) => boolean;
  restoreFocus: boolean;
  returnFocusTo: () => HTMLElement | null;
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  /** The trigger's id, which a rendered trigger may set in place of `ids.trigger`. */
  triggerId: string;
  anchorEl: HTMLElement | null;
  setAnchorEl: (node: HTMLElement | null) => void;
  contentMounted: boolean;
  setContentEl: (node: HTMLElement | null) => void;
  labels: Record<LabelPart, boolean>;
  registerLabel: (part: LabelPart, rendered: boolean) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error("Popover parts must be rendered inside Popover.Root.");
  return context;
}

export interface PopoverRootProps extends MobileLayoutProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** Called once the popover has closed, left the page and handed focus back. */
  onExitComplete?: (() => void) | undefined;
  /** Where the popover opens against its trigger or `Popover.Anchor`. @default "bottom" */
  placement?: PlacementOption | undefined;
  /**
   * What the popover opens against in place of its trigger or `Popover.Anchor`: an element, or
   * `{ getBoundingClientRect }` for a point or a measured box.
   */
  anchor?: Anchor | null | undefined;
  /** Moves focus into the popover when it opens. @default true */
  autoFocus?: boolean | undefined;
  /** The element to focus when it opens, in place of its first focusable one. */
  initialFocusEl?: (() => HTMLElement | null) | undefined;
  /** Moves focus back to the trigger when it closes. @default true */
  restoreFocus?: boolean | undefined;
  /** The element focus returns to in place of the trigger. */
  returnFocusTo?: (() => HTMLElement | null) | undefined;
  /** @default true */
  closeOnEscape?: boolean | undefined;
  /** Closes on a press or focus outside the popover and its trigger. @default true */
  closeOnInteractOutside?: boolean | undefined;
}

interface PopoverRootBaseProps extends PopoverRootProps {
  gutter?: number | undefined;
}

function PopoverRootBase({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onExitComplete,
  mobileLayout,
  placement = "bottom",
  anchor = null,
  gutter,
  autoFocus = true,
  initialFocusEl,
  restoreFocus = true,
  returnFocusTo: returnFocusToProp,
  closeOnEscape = true,
  closeOnInteractOutside = true,
}: PopoverRootBaseProps) {
  const { open, requestOpenChange: requestState } = useOpenState({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  const presentation = useOverlayPresentation({ mobileLayout, anchored: !autoFocus, open });
  const id = useId();
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const [labels, setLabels] = useState({ title: false, description: false });
  const returnFocusTo = useCallback(
    () => returnFocusToProp?.() ?? triggerEl,
    [returnFocusToProp, triggerEl],
  );

  const { setReturnFocus, returningFocus } = usePresentedOverlayFocus(presentation, {
    open,
    popup: contentEl,
    autoFocus,
    initialFocus: initialFocusEl,
    restoreFocus,
    returnFocusTo,
  });
  useOverlayExit(open, contentEl === null && !returningFocus, onExitComplete);

  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      if (!requestState(next, reason, event)) return false;
      if (!next) setReturnFocus(closeFocusIntent(event));
      return true;
    },
    [requestState, setReturnFocus],
  );

  const dismiss = useCallback(
    (reason: DismissReason | SheetCloseReason, event?: Event) => {
      const allowed =
        reason === "escape-key"
          ? closeOnEscape
          : reason === "outside-press" || reason === "focus-out"
            ? closeOnInteractOutside
            : true;
      if (!allowed || !requestOpenChange(false, reason, event)) return false;
      setReturnFocus(dismissFocusIntent(reason, event?.target ?? null));
      return true;
    },
    [closeOnEscape, closeOnInteractOutside, requestOpenChange, setReturnFocus],
  );

  const registerLabel = useCallback((part: LabelPart, rendered: boolean) => {
    setLabels((prev) => (prev[part] === rendered ? prev : { ...prev, [part]: rendered }));
  }, []);

  const value = useMemo<PopoverContextValue>(() => {
    const ids = {
      trigger: `popover:${id}:trigger`,
      content: `popover:${id}:content`,
      title: `popover:${id}:title`,
      description: `popover:${id}:description`,
    };
    return {
      open,
      requestOpenChange,
      ids,
      placement,
      anchor,
      gutter,
      dismiss,
      restoreFocus,
      returnFocusTo,
      triggerEl,
      setTriggerEl,
      triggerId: triggerEl?.id || ids.trigger,
      anchorEl,
      setAnchorEl,
      contentMounted: contentEl !== null,
      setContentEl,
      labels,
      registerLabel,
    };
  }, [
    open,
    requestOpenChange,
    id,
    placement,
    anchor,
    gutter,
    dismiss,
    restoreFocus,
    returnFocusTo,
    triggerEl,
    anchorEl,
    contentEl,
    labels,
    registerLabel,
  ]);

  return (
    <OverlayPresentationContext value={presentation}>
      <PopoverContext value={value}>{children}</PopoverContext>
    </OverlayPresentationContext>
  );
}

const StyledRoot = withRootProvider(PopoverRootBase);

export const PopoverRoot: (props: PopoverRootProps) => ReactNode = StyledRoot;

/** Popover.Root with an internal gutter, for overlays that sit closer to their trigger. */
export const PopoverRootWithGutter: (props: PopoverRootBaseProps) => ReactNode = StyledRoot;

export interface PopoverTriggerProps
  extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

function TriggerPart({
  ref,
  onClick,
  onPointerDown,
  ...props
}: WithRef<ComponentProps<typeof StyledTrigger>, HTMLButtonElement>) {
  const context = usePopoverContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setTriggerEl);
  return (
    <StyledTrigger
      type="button"
      id={context.ids.trigger}
      {...getPopupTriggerProps({
        open: context.open,
        contentId: context.ids.content,
        contentMounted: context.contentMounted,
        haspopup: "dialog",
      })}
      {...props}
      ref={composedRef}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (event.button === 0 && isSafari()) event.currentTarget.focus();
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        context.requestOpenChange(!context.open, "trigger-press", event.nativeEvent);
      }}
    />
  );
}

const PopoverTrigger = withTriggerTooltip(TriggerPart, () => usePopoverContext().open);

function Anchor({ ref, ...props }: WithRef<ComponentProps<typeof StyledAnchor>>) {
  const { setAnchorEl } = usePopoverContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, setAnchorEl);
  return (
    <StyledAnchor
      {...props}
      ref={composedRef}
    />
  );
}

function Indicator(props: ComponentProps<typeof StyledIndicator>) {
  const { open } = usePopoverContext();
  return (
    <StyledIndicator
      {...openStateAttributes(open)}
      {...props}
    />
  );
}

function useRegisterLabel(part: LabelPart) {
  const { registerLabel } = usePopoverContext();
  useLayoutEffect(() => {
    registerLabel(part, true);
    return () => registerLabel(part, false);
  }, [registerLabel, part]);
}

function Title(props: ComponentProps<typeof StyledTitle>) {
  useRegisterLabel("title");
  return (
    <StyledTitle
      id={usePopoverContext().ids.title}
      {...props}
    />
  );
}

function Description(props: ComponentProps<typeof StyledDescription>) {
  useRegisterLabel("description");
  return (
    <StyledDescription
      id={usePopoverContext().ids.description}
      {...props}
    />
  );
}

function CloseTriggerPart({ onClick, ...props }: ComponentProps<typeof StyledCloseTrigger>) {
  const context = usePopoverContext();
  return (
    <StyledCloseTrigger
      type="button"
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.stopPropagation();
        context.requestOpenChange(false, "close-press", event.nativeEvent);
      }}
    />
  );
}

export interface PopoverFooterProps extends ComponentProps<typeof StyledFooter> {
  /** Actions share the footer's width, start-aligned, edge to edge with a list body's rows. */
  stretch?: boolean;
}

function Footer({ stretch, ...props }: PopoverFooterProps) {
  return (
    <StyledFooter
      data-stretch={stretch ? "" : undefined}
      {...props}
    />
  );
}

export type PopoverContentProps = ComponentProps<typeof StyledContent>;

function ContentElement({
  ref,
  status,
  ...props
}: WithRef<PopoverContentProps> & { status?: TransitionStatus }) {
  const context = usePopoverContext();
  const sheet = useOverlayMode() === "sheet";
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setContentEl);
  return (
    <StyledContent
      id={context.ids.content}
      role={sheet ? undefined : "dialog"}
      tabIndex={-1}
      aria-labelledby={!sheet && context.labels.title ? context.ids.title : undefined}
      aria-describedby={!sheet && context.labels.description ? context.ids.description : undefined}
      {...presenceAttributes(status)}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
    />
  );
}

function AnchoredContent({ ref, ...props }: WithRef<PopoverContentProps>) {
  const context = usePopoverContext();
  const popup = useAnchoredPopup({
    open: context.open,
    placement: context.placement,
    anchor: context.anchor ?? context.anchorEl ?? context.triggerEl,
    gutter: context.gutter,
    trigger: context.triggerEl,
    contains: (target) => context.anchorEl?.contains(target) ?? false,
    dismiss: context.dismiss,
  });
  const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, popup.setElement);

  if (!popup.mounted) return null;

  return (
    <Positioner popup={popup}>
      <ContentElement
        data-side={popup.side}
        data-align={popup.align}
        status={popup.status}
        {...props}
        ref={elementRef}
      />
    </Positioner>
  );
}

function SheetContent(props: WithRef<PopoverContentProps>) {
  const context = usePopoverContext();
  const [label, rest] = splitSheetLabel(props);
  const api = {
    open: context.open,
    dismiss: context.dismiss,
    restoreFocus: context.restoreFocus,
    returnFocusTo: context.returnFocusTo,
    label: {
      role: label.role,
      "aria-label": label["aria-label"],
      "aria-labelledby":
        label["aria-labelledby"] ?? (context.labels.title ? context.ids.title : undefined),
      "aria-describedby":
        label["aria-describedby"] ??
        (context.labels.description ? context.ids.description : undefined),
    },
  };
  return (
    <SheetOverlayContent
      {...(rest as Record<string, unknown>)}
      api={api}
      Content={ContentElement}
    />
  );
}

function PopoverContent(props: WithRef<PopoverContentProps>) {
  return useOverlayMode() === "sheet" ? (
    <SheetContent {...props} />
  ) : (
    <AnchoredContent {...props} />
  );
}

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Anchor,
  Arrow,
  ArrowTip,
  CloseTrigger: createCloseTrigger(CloseTriggerPart),
  Indicator,
  Title,
  Description,
  Footer,
  Header,
  Body,
  Trigger: PopoverTrigger,
};
