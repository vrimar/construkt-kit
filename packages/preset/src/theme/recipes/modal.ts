import type { GlobalVarsDefinition } from "@pandacss/types";

import { anchoredHitArea, surface } from "./control-size";
import { topLayerReset } from "./floating";

/** Variables a modal's `<dialog>` and content get from the drawer swipe and nested dialogs. */
export const modalGlobalVars: GlobalVarsDefinition = {
  // Set on the <dialog>; its ::backdrop reads it through inheritance.
  "--drawer-swipe-progress": { syntax: "*", inherits: true },
  "--nested-dialogs": { syntax: "*", inherits: false },
};

export const modalInset = { base: surface("1rem"), md: surface("1.5rem") };

/** Positioner rendered as the modal `<dialog>`, filling the viewport in the top layer. */
export const modalPositioner = {
  ...topLayerReset,
  paddingBlock: "0",
  maxWidth: "none",
  maxHeight: "none",
  outline: "0",
  position: "fixed",
  top: "0",
  height: "100dvh",
  overscrollBehaviorY: "none",
  _open: { display: "flex" },
  "&[data-no-backdrop]": { _backdrop: { background: "transparent", animation: "none" } },
} as const;

interface BackdropMotion {
  enter: string;
  exit: string;
  exitName: string;
}

export const modalBackdrop = (
  { enter, exit, exitName }: BackdropMotion,
  backdrop: Record<string, string> = {},
) => ({
  _backdrop: {
    background: "black.a7",
    ...backdrop,
    animationName: "fade-in",
    animationTimingFunction: "emphasized-in",
    animationDuration: enter,
  },
  _closed: {
    _backdrop: {
      animationName: exitName,
      animationTimingFunction: "emphasized-out",
      animationDuration: exit,
    },
  },
});

export const modalCloseTrigger = (top: string, insetEnd: string) => ({
  pos: "absolute",
  top,
  insetEnd,
  ...anchoredHitArea,
  "[data-slot=header] > &": { pos: "relative", top: "auto", insetEnd: "auto", flexShrink: "0" },
});

export const modalDescription = {
  color: "fg.muted",
  textStyle: "sm",
} as const;

export const modalFooter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flex: "0",
  gap: surface("0.75rem"),
  px: modalInset,
} as const;
