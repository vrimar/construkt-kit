import type { GlobalVarsDefinition } from "@pandacss/types";

/** The selected item's box, which a segmented control's or tab list's indicator slides to. */
export const indicatorGlobalVars: GlobalVarsDefinition = {
  "--indicator-left": { syntax: "*", inherits: false },
  "--indicator-top": { syntax: "*", inherits: false },
  "--indicator-width": { syntax: "*", inherits: false },
  "--indicator-height": { syntax: "*", inherits: false },
};

export const slidingIndicator = {
  position: "absolute",
  width: "var(--indicator-width)",
  height: "var(--indicator-height)",
  transitionProperty: "left, top, width, height",
  transitionDuration: "fast",
  _horizontal: { left: "var(--indicator-left)" },
  _vertical: { top: "var(--indicator-top)" },
} as const;
