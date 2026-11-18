import { segmentGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import {
  enclosedItem,
  enclosedThumb,
  enclosedTrack,
  itemTier,
  outlineThumb,
  outlineTrack,
} from "./segmented";

export const segmentGroup = defineSlotRecipe({
  className: "segment-group",
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      isolation: "isolate",
      pos: "relative",
      maxWidth: "100%",
      overflowX: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      _vertical: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "lg",
      display: "inline-flex",
      flexShrink: "0",
      fontWeight: "medium",
      gap: "2",
      justifyContent: "center",
      position: "relative",
      userSelect: "none",
      cursor: "pointer",
      _disabled: {
        opacity: "0.5",
      },
      "&:has(input:focus-visible)": {
        focusVisibleRing: "outside",
      },
    },

    indicator: {
      borderWidth: "1px",
      borderRadius: "lg",
      height: "var(--height)",
      pos: "absolute",
      width: "var(--width)",
      zIndex: -1,
    },
  },

  defaultVariants: {
    variant: "enclosed",
    size: "md",
  },

  variants: {
    variant: {
      enclosed: {
        root: enclosedTrack,
        item: enclosedItem("0"),
        indicator: enclosedThumb,
      },
      outline: {
        root: {
          ...outlineTrack,
          colorPalette: "neutral",
        },
        item: {
          color: "colorPalette.outline.fg",
          "&[data-state=unchecked]": {
            _hover: {
              bg: "colorPalette.outline.bg.hover",
            },
          },
        },
        indicator: outlineThumb,
      },
    },
    size: {
      xs: itemTier("xs"),
      sm: itemTier("sm"),
      md: itemTier("md"),
      lg: itemTier("lg"),
      xl: itemTier("xl"),
    },
    fitted: {
      true: {
        root: {
          display: "flex",
        },
        item: {
          flex: "1",
        },
      },
    },
  },
});
