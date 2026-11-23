import type { GlobalVarsDefinition } from "@pandacss/types";

import { controlText } from "./control-size";

const measured = { syntax: "*", inherits: true } as const;

/** Variables a popup's positioner writes for its content to read. */
export const floatingGlobalVars: GlobalVarsDefinition = {
  "--anchor-width": measured,
  "--anchor-height": measured,
  "--available-width": measured,
  "--available-height": measured,
  "--transform-origin": measured,
};

/**
 * The inherited text styles `<body>` gives, for a top-layer popup or dialog rendered in place to
 * reset what it would otherwise inherit from wherever it is declared.
 */
export const bodyText = {
  fontFamily: "body",
  fontSize: "1rem",
  fontStyle: "normal",
  fontWeight: "normal",
  fontVariant: "normal",
  fontFeatureSettings: "var(--font-body-features)",
  lineHeight: "1.5",
  letterSpacing: "normal",
  wordSpacing: "normal",
  textAlign: "start",
  textTransform: "none",
  whiteSpace: "normal",
  wordBreak: "normal",
  overflowWrap: "normal",
  userSelect: "text",
} as const;

/**
 * An element rendered in place in the top layer: clears the box the browser draws for `[popover]` or
 * `<dialog>` and the styles it would otherwise inherit from wherever it is declared.
 */
export const topLayerReset = {
  margin: "0",
  border: "0",
  background: "transparent",
  colorPalette: "brand",
  color: "fg",
  ...bodyText,
  cursor: "auto",
  pointerEvents: "auto",
  visibility: "visible",
} as const;

/** Positioner of a popup rendered in place in the top layer. */
export const floatingPositioner = {
  ...topLayerReset,
  inset: "auto",
  padding: "0",
  overflow: "visible",
} as const;

export const floatingContent = {
  layerStyle: "floating.surface",
  display: "flex",
  flexDirection: "column",
  outline: "0",
  position: "relative",
  ...controlText("sm"),
  transformOrigin: "var(--transform-origin)",
} as const;

export const pickerParts = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5",
  },
  control: {
    display: "flex",
    flexDirection: "row",
    gap: "2",
  },
  positioner: floatingPositioner,
  content: {
    layerStyle: "floating.surface",
    display: "flex",
    flexDirection: "column",
    gap: "3",
    p: "4",
  },
} as const;

/** Arrow + tip slots shared by the floating surfaces (popover, hover card, tooltip). */
export const floatingArrow = {
  arrow: {
    "--arrow-size": "sizes.3",
    "--arrow-background": "colors.neutral.surface.bg",
    "--arrow-size-half": "calc(var(--arrow-size) / 2)",
    "--arrow-offset": "calc(var(--arrow-size-half) * -1)",
    position: "absolute",
    width: "var(--arrow-size)",
    height: "var(--arrow-size)",
  },
  arrowTip: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    zIndex: "inherit",
    background: "var(--arrow-background)",
    borderTopWidth: "0.5px",
    // Physical, like the rotations below that turn this corner toward the trigger.
    borderLeftWidth: "0.5px",
    _sideBottom: { transform: "rotate(45deg)" },
    _sideLeft: { transform: "rotate(135deg)" },
    _sideTop: { transform: "rotate(225deg)" },
    _sideRight: { transform: "rotate(315deg)" },
  },
} as const;
