import type { GlobalVarsDefinition } from "@pandacss/types";

import { bodyText } from "./floating";

/** Variables a modal's `<dialog>` and content get from the drawer swipe and nested dialogs. */
export const modalGlobalVars: GlobalVarsDefinition = {
  // Set on the <dialog>; its ::backdrop reads it through inheritance.
  "--drawer-swipe-progress": { syntax: "*", inherits: true },
  "--nested-dialogs": { syntax: "*", inherits: false },
};

/**
 * Positioner rendered as the modal `<dialog>` in the top layer: clears the box and `::backdrop`
 * the browser draws, and the text styles it would otherwise inherit from wherever it is rendered.
 */
export const modalPositioner = {
  margin: "0",
  paddingBlock: "0",
  border: "0",
  background: "transparent",
  maxWidth: "none",
  maxHeight: "none",
  outline: "0",
  colorPalette: "brand",
  color: "fg",
  ...bodyText,
  cursor: "auto",
  pointerEvents: "auto",
  visibility: "visible",
} as const;
