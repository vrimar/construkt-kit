import { PresenceProvider, usePresence, usePresenceContext } from "@ark-ui/react/presence";
import {
  type ComponentProps,
  type ElementType,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import { useComposedRefs } from "../hooks/useComposedRefs";
import { useLatestRef } from "../hooks/useLatestRef";
import type { PortalledProps, WithRef } from "../types";
import { useOverlayMode, useSheetPresentation } from "./overlayPresentation";
import { type PortalledContentComponent, createPortalledContent } from "./portalledContent";
import { Sheet } from "./Sheet";

export const SHEET_FRAME_ATTRIBUTE = "data-overlay-sheet";
export const SHEET_PANEL_ATTRIBUTE = "data-overlay-sheet-content";

interface SheetApi {
  open: boolean;
  inline?: boolean;
  setOpen: (open: boolean) => void;
  getTriggerProps: () => { id?: string | undefined };
}

function UnmountEffect({ onUnmount }: { onUnmount: () => void }) {
  const onUnmountRef = useLatestRef(onUnmount);
  useEffect(() => () => onUnmountRef.current(), [onUnmountRef]);
  return null;
}

// The drawer stays present through its exit animation; the inner content must outlive it too.
function InnerPresence({ children, onUnmount }: { children: ReactNode; onUnmount: () => void }) {
  const { present } = usePresenceContext();
  const presence = usePresence({ present, lazyMount: true, unmountOnExit: true });

  return (
    <PresenceProvider value={presence}>
      {children}
      {!presence.unmounted && <UnmountEffect onUnmount={onUnmount} />}
    </PresenceProvider>
  );
}

// zag fires these on the layer it is about to dismiss, which stays open if one is cancelled.
const OUTSIDE_INTERACTION_EVENTS = ["pointerdown.outside", "focus.outside"];

function keepPanelsOpenOnChrome(frame: HTMLDivElement | null) {
  if (frame == null) return;
  const keepOpen = (event: Event) => {
    const layer = event.target;
    const { target } = (event as CustomEvent<{ target: EventTarget }>).detail;
    if (!(layer instanceof Element) || !layer.hasAttribute(SHEET_PANEL_ATTRIBUTE)) return;
    if (target instanceof Node && frame.contains(target)) event.preventDefault();
  };
  for (const type of OUTSIDE_INTERACTION_EVENTS) frame.addEventListener(type, keepOpen, true);
  return () => {
    for (const type of OUTSIDE_INTERACTION_EVENTS) frame.removeEventListener(type, keepOpen, true);
  };
}

interface SheetFrameProps {
  api: SheetApi;
  portalRef?: RefObject<HTMLElement | null>;
  fullHeight?: boolean;
  children: ReactNode;
}

function SheetFrame({ api, portalRef, fullHeight = false, children }: SheetFrameProps) {
  const presentation = useSheetPresentation();
  const frameRef = presentation?.frameRef;
  const composedFrameRef = useComposedRefs(frameRef, keepPanelsOpenOnChrome);
  const onExitCompleteRef = useLatestRef(presentation?.onSheetExitComplete);

  // Unmounting mid-exit skips onExitComplete, which would hold the overlay in sheet mode.
  useEffect(() => () => onExitCompleteRef.current?.(), [onExitCompleteRef]);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openRef = useLatestRef(api.open);

  useLayoutEffect(() => {
    if (!api.open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) returnFocusRef.current = active;
  }, [api.open]);

  const getReturnFocusEl = () => {
    const id = api.getTriggerProps().id;
    return (id == null ? null : document.getElementById(id)) ?? returnFocusRef.current;
  };

  // An inner machine can restore focus while the trap is still up, which pulls it back inside.
  const restoreLostFocus = () => {
    const active = document.activeElement;
    if (active == null || active === document.body) {
      getReturnFocusEl()?.focus({ preventScroll: true });
    }
  };

  const getInitialFocusEl = () => {
    const frame = frameRef?.current;
    const active = document.activeElement;
    if (!openRef.current) return false;
    if (frame == null) return null;
    if (active instanceof HTMLElement && frame.contains(active)) return active;
    return frame.querySelector<HTMLElement>(`[${SHEET_PANEL_ATTRIBUTE}]`);
  };

  if (!api.open && !presentation?.sheetExiting) return null;

  return (
    <Sheet.Root
      {...presentation?.dismissProps}
      open={api.open}
      onOpenChange={({ open }) => {
        if (!open) api.setOpen(false);
      }}
      onExitComplete={presentation?.onSheetExitComplete}
      trapFocus
      restoreFocus
      initialFocusEl={getInitialFocusEl}
      finalFocusEl={getReturnFocusEl}
    >
      <Sheet.Content
        ref={composedFrameRef}
        portalRef={portalRef}
        fullHeight={fullHeight}
        role="presentation"
        aria-modal={false}
        {...{ [SHEET_FRAME_ATTRIBUTE]: "" }}
      >
        <InnerPresence onUnmount={restoreLostFocus}>{children}</InnerPresence>
      </Sheet.Content>
    </Sheet.Root>
  );
}

export function SheetPanel({
  Content,
  ...props
}: { Content: ElementType } & Record<string, unknown>) {
  return (
    <Content
      animation="none"
      {...{ [SHEET_PANEL_ATTRIBUTE]: "" }}
      {...props}
    />
  );
}

interface SheetOverlayContentProps extends PortalledProps {
  api: SheetApi;
  Content: ElementType;
  fullHeight?: boolean;
  header?: ReactNode;
}

export function SheetOverlayContent({
  api,
  Content,
  portalled: _sheetsAlwaysPortal,
  portalRef,
  fullHeight,
  header,
  ...contentProps
}: SheetOverlayContentProps & Record<string, unknown>) {
  return (
    <SheetFrame
      api={api}
      portalRef={portalRef}
      fullHeight={fullHeight}
    >
      {header}
      <SheetPanel
        Content={Content}
        {...contentProps}
      />
    </SheetFrame>
  );
}

export function createSheetCapableContent<C extends ElementType>(
  Positioner: ElementType,
  Content: C,
  useSheetApi: () => SheetApi,
): PortalledContentComponent<C> {
  const ContentElement: ElementType = Content;
  const AnchoredContent = createPortalledContent(Positioner, Content);

  function InlineContent({
    portalled: _inlineNeverPortals,
    portalRef: _inlineHasNoPortal,
    ...rest
  }: WithRef<ComponentProps<C> & PortalledProps>) {
    return (
      <ContentElement
        animation="none"
        {...rest}
      />
    );
  }

  return function SheetCapableContent(props) {
    const api = useSheetApi();
    const mode = useOverlayMode();
    if (api.inline) return <InlineContent {...props} />;
    if (mode === "sheet") {
      return (
        <SheetOverlayContent
          {...(props as Record<string, unknown>)}
          api={api}
          Content={Content}
        />
      );
    }
    return <AnchoredContent {...props} />;
  };
}
