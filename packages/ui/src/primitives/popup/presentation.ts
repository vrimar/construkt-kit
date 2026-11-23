import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useIsMobile } from "../../hooks/useMediaQuery";
import { type ReturnFocusIntent, type UseOverlayFocusOptions, useOverlayFocus } from "../focus";
import { useOverlayExit } from "../layer";

export type MobileLayout = "sheet" | "popover";

export interface MobileLayoutProps {
  /** How the overlay opens below the `md` breakpoint. @default "sheet" */
  mobileLayout?: MobileLayout;
}

export interface OverlayPresentation {
  mode: MobileLayout;
  sheetExiting: boolean;
  onSheetExitComplete: () => void;
}

/** The presentation of the overlay whose parts render inside it, from `useOverlayPresentation`. */
export const OverlayPresentationContext = createContext<OverlayPresentation | null>(null);

export const useOverlayMode = (): MobileLayout =>
  useContext(OverlayPresentationContext)?.mode ?? "popover";

export const useSheetPresentation = () => useContext(OverlayPresentationContext);

export interface OverlayPresentationOptions extends MobileLayoutProps {
  open: boolean;
  /**
   * Keeps the overlay anchored on a phone: one that won't take focus accompanies a focused field,
   * and one shown in place never floats.
   */
  anchored?: boolean | undefined;
}

/**
 * Whether an overlay opens as a phone sheet or anchored to its trigger, held while it is open and
 * while its sheet animates out. The root provides it through `OverlayPresentationContext`.
 */
export function useOverlayPresentation({
  mobileLayout = "sheet",
  anchored = false,
  open,
}: OverlayPresentationOptions): OverlayPresentation {
  const isMobile = useIsMobile();
  const live: MobileLayout =
    mobileLayout === "sheet" && !anchored && isMobile ? "sheet" : "popover";
  const [held, setHeld] = useState(live);
  const [prevOpen, setPrevOpen] = useState(open);
  const [sheetExiting, setSheetExiting] = useState(false);
  const closingSheet = prevOpen && !open && held === "sheet";

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (closingSheet) setSheetExiting(true);
  }

  // Switching mode while open, or while the sheet animates out, would orphan its layers.
  const holding = open || sheetExiting || closingSheet;
  if (!holding && held !== live) setHeld(live);

  const mode = holding ? held : live;
  const exiting = sheetExiting || closingSheet;
  const onSheetExitComplete = useCallback(() => setSheetExiting(false), []);
  return useMemo(
    () => ({ mode, sheetExiting: exiting, onSheetExitComplete }),
    [mode, exiting, onSheetExitComplete],
  );
}

export interface PopupPresentationOptions extends OverlayPresentationOptions {
  content: HTMLElement | null;
  autoFocus: boolean;
  initialFocus?: UseOverlayFocusOptions["initialFocus"];
  restoreFocus: boolean;
  returnFocusTo: () => HTMLElement | null;
  onExitComplete?: (() => void) | undefined;
}

export interface PopupPresentation {
  presentation: OverlayPresentation;
  /** Call before closing to say how focus should return. */
  setReturnFocus: (intent: ReturnFocusIntent) => void;
}

/**
 * How a popup opens, as a phone sheet or anchored, and the focus moves and exit that follow: an
 * anchored popup takes and returns focus itself, while a sheet's frame returns it.
 */
export function usePopupPresentation({
  mobileLayout,
  anchored,
  open,
  content,
  autoFocus,
  initialFocus,
  restoreFocus,
  returnFocusTo,
  onExitComplete,
}: PopupPresentationOptions): PopupPresentation {
  const presentation = useOverlayPresentation({ mobileLayout, anchored, open });
  const { setReturnFocus, returningFocus } = useOverlayFocus({
    open,
    popup: content,
    autoFocus,
    initialFocus,
    restoreFocus: restoreFocus && presentation.mode !== "sheet",
    returnFocusTo,
  });
  useOverlayExit(open, content === null && !returningFocus, onExitComplete);
  return { presentation, setReturnFocus };
}
