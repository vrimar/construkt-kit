import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { touchHitArea } from "./control-size";

const LINE = '&:is([data-instruction="before"], [data-instruction="after"])';
const BEFORE = '&[data-instruction="before"]';
const AFTER = '&[data-instruction="after"]';
export const sortableGlobalVars: GlobalVarsDefinition = {
  "--sortable-indicator-offset": { syntax: "*", inherits: false },
};

const OFFSET = "calc(-1 * var(--sortable-indicator-offset, 0px))";

export const sortable = defineSlotRecipe({
  className: "sortable",
  slots: ["root", "item", "handle", "indicator"],
  base: {
    root: {
      display: "flex",
    },
    item: {
      position: "relative",
      "&[data-dragging]": {
        opacity: "0.4",
      },
    },
    handle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      p: "0.5",
      rounded: "sm",
      color: "fg.subtle",
      cursor: "grab",
      transitionProperty: "opacity, color, background-color",
      transitionDuration: "fast",
      transitionTimingFunction: "default",
      _icon: {
        boxSize: "4",
      },
      _hover: {
        color: "fg.muted",
        bg: "bg.muted",
      },
      _active: {
        cursor: "grabbing",
      },
      _disabled: {
        layerStyle: "disabled",
      },
      focusVisibleRing: "outside",
      ...touchHitArea(),
    },
    indicator: {
      colorPalette: "blue",
      position: "absolute",
      pointerEvents: "none",
      zIndex: "1",
      [LINE]: {
        bg: "colorPalette.solid.bg",
        borderRadius: "full",
      },
      '&[data-instruction="onto"]': {
        inset: "0",
        borderWidth: "2px",
        borderColor: "colorPalette.solid.bg",
        borderRadius: "inherit",
      },
    },
  },
  defaultVariants: {
    axis: "vertical",
    handleVisibility: "hover",
  },
  variants: {
    axis: {
      vertical: {
        root: { flexDirection: "column" },
        indicator: {
          [LINE]: { insetInline: "0", height: "2px" },
          [BEFORE]: { top: OFFSET },
          [AFTER]: { bottom: OFFSET },
        },
      },
      horizontal: {
        root: { flexDirection: "row" },
        indicator: {
          [LINE]: { insetBlock: "0", width: "2px" },
          [BEFORE]: { insetInlineStart: OFFSET },
          [AFTER]: { insetInlineEnd: OFFSET },
        },
      },
    },
    handleVisibility: {
      always: {},
      hover: {
        handle: {
          _unrevealed: {
            opacity: "0",
          },
        },
      },
    },
  },
});
