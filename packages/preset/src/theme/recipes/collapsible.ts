import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

/** A collapsible or accordion panel's measured size, which its open and close animations run to and from. */
export const collapsibleGlobalVars: GlobalVarsDefinition = {
  "--collapsible-height": { syntax: "*", inherits: false },
  "--collapsible-width": { syntax: "*", inherits: false },
};

export const collapsiblePanel = {
  overflow: "hidden",
  _open: {
    animationName: "expand-height, fade-in",
    animationDuration: "normal",
  },
  _closed: {
    animationName: "collapse-height, fade-out",
    animationDuration: "normal",
    animationFillMode: "forwards",
  },
} as const;

export const collapsible = defineSlotRecipe({
  className: "collapsible",
  slots: ["root", "trigger", "content", "indicator"],
  base: {
    content: collapsiblePanel,
  },
});
