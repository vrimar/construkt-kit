import type { GlobalVarsDefinition } from "@pandacss/types";

/** The selected item's box, which a segmented control's or tab list's indicator slides to. */
export const indicatorGlobalVars: GlobalVarsDefinition = {
  "--indicator-left": { syntax: "*", inherits: false },
  "--indicator-top": { syntax: "*", inherits: false },
  "--indicator-width": { syntax: "*", inherits: false },
  "--indicator-height": { syntax: "*", inherits: false },
};
