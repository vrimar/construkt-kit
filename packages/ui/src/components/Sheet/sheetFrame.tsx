import {
  type ElementType,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { OpenChangeDetails } from "../../primitives/layer";
import { useSheetPresentation } from "../../primitives/popup";
import { FloatingContext } from "../floating";
import { SheetContent, SheetRoot } from "./sheetParts";

export const SHEET_FRAME_ATTRIBUTE = "data-overlay-sheet";
export const SHEET_PANEL_ATTRIBUTE = "data-overlay-sheet-content";

export type SheetCloseReason = "escape-key" | "outside-press" | "close-press" | "swipe";

interface SheetApi {
  open: boolean;
  /** Asks the overlay to close; returns whether it did. */
  dismiss: (reason: SheetCloseReason, event?: Event) => boolean;
  restoreFocus: boolean;
  /** The element focus returns to; the one focused before the sheet opened when it gives none. */
  returnFocusTo: () => HTMLElement | null;
  /** Names the sheet after a dialog overlay, whose panel then takes no dialog role of its own. */
  label?: SheetLabel | undefined;
}

export interface SheetLabel {
  role?: "dialog" | "alertdialog" | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
}

type SheetLabelSource = Omit<SheetLabel, "role"> & { role?: string | undefined };

/** Splits a dialog overlay's role and naming props off its content props, for the sheet to carry. */
export function splitSheetLabel<P extends SheetLabelSource>({
  role,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...rest
}: P): [SheetLabel, Omit<P, keyof SheetLabel>] {
  return [
    {
      role: role === "alertdialog" ? "alertdialog" : undefined,
      "aria-label": label,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
    },
    rest,
  ];
}

const panelTakesFocus = () => false as const;

const SheetFrameContext = createContext<HTMLElement | null>(null);

/** The open phone sheet's frame, where a drill-down panel portals; `null` outside a sheet. */
export const useSheetFrame = (): HTMLElement | null => useContext(SheetFrameContext);

interface SheetFrameProps {
  api: SheetApi;
  fullHeight?: boolean;
  children: ReactNode;
}

function SheetFrame({ api, fullHeight = false, children }: SheetFrameProps) {
  const presentation = useSheetPresentation();
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const onExitCompleteRef = useLatestRef(presentation?.onSheetExitComplete);

  // Unmounting mid-exit skips onExitComplete, which would hold the overlay in sheet mode.
  useEffect(() => () => onExitCompleteRef.current?.(), [onExitCompleteRef]);

  // A panel moves focus into itself a frame after it opens; the sheet steps in only when it doesn't.
  useEffect(() => {
    if (!api.open || !frame) return;
    let next = 0;
    const first = requestAnimationFrame(() => {
      next = requestAnimationFrame(() => {
        if (frame.contains(frame.ownerDocument.activeElement)) return;
        frame
          .querySelector<HTMLElement>(`[${SHEET_PANEL_ATTRIBUTE}]`)
          ?.focus({ preventScroll: true });
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(next);
    };
  }, [api.open, frame]);

  if (!api.open && !presentation?.sheetExiting) return null;

  const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    if (next) return;
    if (!api.dismiss(details.reason as SheetCloseReason, details.event)) details.cancel();
  };

  return (
    <SheetRoot
      open={api.open}
      onOpenChange={onOpenChange}
      onExitComplete={presentation?.onSheetExitComplete}
      initialFocusEl={panelTakesFocus}
      restoreFocus={api.restoreFocus}
      returnFocusTo={api.returnFocusTo}
      {...api.label}
    >
      <SheetContent
        ref={setFrame}
        fullHeight={fullHeight}
        {...{ [SHEET_FRAME_ATTRIBUTE]: "" }}
      >
        <FloatingContext value={null}>
          <SheetFrameContext value={frame}>{children}</SheetFrameContext>
        </FloatingContext>
      </SheetContent>
    </SheetRoot>
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

interface SheetOverlayContentProps {
  api: SheetApi;
  Content: ElementType;
  fullHeight?: boolean;
  header?: ReactNode;
}

export function SheetOverlayContent({
  api,
  Content,
  fullHeight,
  header,
  ...contentProps
}: SheetOverlayContentProps & Record<string, unknown>) {
  return (
    <SheetFrame
      api={api}
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
