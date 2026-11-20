import { createContext, useContext, useState } from "react";

import { useIsMobile } from "../hooks/useMediaQuery";
import {
  type OverlayFocus,
  type UseOverlayFocusOptions,
  useOverlayFocus,
} from "../primitives/focus";

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

  return {
    mode: holding ? held : live,
    sheetExiting: sheetExiting || closingSheet,
    onSheetExitComplete: () => setSheetExiting(false),
  };
}

/** `useOverlayFocus` for an overlay that may open as a phone sheet, whose frame returns focus itself. */
export function usePresentedOverlayFocus(
  presentation: OverlayPresentation,
  options: UseOverlayFocusOptions,
): OverlayFocus {
  return useOverlayFocus({
    ...options,
    restoreFocus: options.restoreFocus && presentation.mode !== "sheet",
  });
}
