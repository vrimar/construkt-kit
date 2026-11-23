import { useCallback, useId, useMemo, useState } from "react";

import { closeFocusIntent, dismissFocusIntent } from "../focus";
import {
  type DismissReason,
  type OpenChangeReason,
  type UseOpenStateOptions,
  allowsDismiss,
  useOpenState,
} from "../layer";
import type { Anchor, PlacementOption } from "../position";
import {
  type MobileLayoutProps,
  type OverlayPresentation,
  usePopupPresentation,
} from "./presentation";

export type PopupDismissReason = DismissReason | "close-press" | "swipe";

export interface PopupOptions extends MobileLayoutProps, UseOpenStateOptions {
  idPrefix: string;
  /** Shows the content in place, always open, with no trigger or popup. */
  inline?: boolean | undefined;
  /** Keeps the popup closed, and its trigger free of popup state. */
  disabled?: boolean | undefined;
  placement?: PlacementOption | undefined;
  /** What the popup opens against in place of its anchor element or trigger. */
  anchor?: Anchor | null | undefined;
  gutter?: number | undefined;
  autoFocus?: boolean | undefined;
  initialFocus?: ((content: HTMLElement) => HTMLElement | null) | undefined;
  restoreFocus?: boolean | undefined;
  returnFocusTo?: (() => HTMLElement | null) | undefined;
  closeOnEscape?: boolean | undefined;
  closeOnInteractOutside?: boolean | undefined;
  onExitComplete?: (() => void) | undefined;
}

export interface Popup {
  open: boolean;
  inline: boolean;
  disabled: boolean;
  placement: PlacementOption;
  anchor: Anchor | null;
  gutter: number | undefined;
  presentation: OverlayPresentation;
  ids: { trigger: string; content: string };
  /** The trigger's id, which a rendered trigger may set in place of `ids.trigger`. */
  triggerId: string;
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (node: HTMLElement | null) => void;
  contentEl: HTMLElement | null;
  setContentEl: (node: HTMLElement | null) => void;
  restoreFocus: boolean;
  returnFocusTo: () => HTMLElement | null;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
  /** Closes for Escape, a press outside or focus leaving, and returns focus as that implies. */
  dismiss: (reason: PopupDismissReason, event?: Event) => boolean;
}

export function usePopup({
  idPrefix,
  open: openProp,
  defaultOpen,
  onOpenChange,
  mobileLayout,
  inline = false,
  disabled = false,
  placement = "bottom",
  anchor = null,
  gutter,
  autoFocus = true,
  initialFocus,
  restoreFocus: restoreFocusProp = true,
  returnFocusTo: returnFocusToProp,
  closeOnEscape,
  closeOnInteractOutside,
  onExitComplete,
}: PopupOptions): Popup {
  const state = useOpenState({ open: openProp, defaultOpen, onOpenChange });
  const open = inline || (!disabled && state.open);
  const restoreFocus = restoreFocusProp && !inline;
  const id = useId();
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const returnFocusTo = useCallback(
    () => returnFocusToProp?.() ?? triggerEl,
    [returnFocusToProp, triggerEl],
  );

  const { presentation, setReturnFocus } = usePopupPresentation({
    mobileLayout,
    anchored: inline || !autoFocus,
    open,
    content: contentEl,
    autoFocus: autoFocus && !inline,
    initialFocus,
    restoreFocus,
    returnFocusTo,
    onExitComplete,
  });

  const requestState = state.requestOpenChange;
  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      if (inline || (next && disabled) || !requestState(next, reason, event)) return false;
      if (!next) setReturnFocus(closeFocusIntent(event));
      return true;
    },
    [inline, disabled, requestState, setReturnFocus],
  );

  const dismiss = useCallback(
    (reason: PopupDismissReason, event?: Event) => {
      if (!allowsDismiss(reason, { closeOnEscape, closeOnInteractOutside })) return false;
      if (!requestOpenChange(false, reason, event)) return false;
      setReturnFocus(dismissFocusIntent(reason, event?.target ?? null));
      return true;
    },
    [closeOnEscape, closeOnInteractOutside, requestOpenChange, setReturnFocus],
  );

  return useMemo(() => {
    const ids = { trigger: `${idPrefix}:${id}:trigger`, content: `${idPrefix}:${id}:content` };
    return {
      open,
      inline,
      disabled,
      placement,
      anchor,
      gutter,
      presentation,
      ids,
      triggerId: triggerEl?.id || ids.trigger,
      triggerEl,
      setTriggerEl,
      anchorEl,
      setAnchorEl,
      contentEl,
      setContentEl,
      restoreFocus,
      returnFocusTo,
      requestOpenChange,
      dismiss,
    };
  }, [
    idPrefix,
    id,
    open,
    inline,
    disabled,
    placement,
    anchor,
    gutter,
    presentation,
    triggerEl,
    anchorEl,
    contentEl,
    restoreFocus,
    returnFocusTo,
    requestOpenChange,
    dismiss,
  ]);
}
