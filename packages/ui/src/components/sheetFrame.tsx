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

import { useLatestRef } from "../hooks/useLatestRef";
import type { PortalledProps, WithRef } from "../types";
import { useOverlayMode, useSheetPresentation } from "./overlayPresentation";
import { type PortalledContentComponent, createPortalledContent } from "./portalledContent";
import { Sheet } from "./Sheet";

export interface SheetApi {
  open: boolean;
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

interface SheetFrameProps {
  api: SheetApi;
  portalRef?: RefObject<HTMLElement | null>;
  fullHeight?: boolean;
  children: ReactNode;
}

export function SheetFrame({ api, portalRef, fullHeight = false, children }: SheetFrameProps) {
  const presentation = useSheetPresentation();
  const frameRef = presentation?.frameRef;
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
    return frame.querySelector<HTMLElement>("[data-overlay-sheet-content]");
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
        ref={frameRef}
        portalRef={portalRef}
        fullHeight={fullHeight}
        role="presentation"
        aria-modal={false}
        data-overlay-sheet=""
      >
        <InnerPresence onUnmount={restoreLostFocus}>{children}</InnerPresence>
      </Sheet.Content>
    </Sheet.Root>
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
      <Content
        animation="none"
        data-overlay-sheet-content=""
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
  const AnchoredContent = createPortalledContent(Positioner, Content);

  function SheetContent(props: WithRef<ComponentProps<C> & PortalledProps>) {
    return (
      <SheetOverlayContent
        {...(props as Record<string, unknown>)}
        api={useSheetApi()}
        Content={Content}
      />
    );
  }

  return function SheetCapableContent(props) {
    if (useOverlayMode() === "sheet") return <SheetContent {...props} />;
    return <AnchoredContent {...props} />;
  };
}
