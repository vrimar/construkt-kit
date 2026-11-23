import { defineSlotRecipe } from "@pandacss/dev";

import { slidingIndicator } from "./indicator";
import {
  enclosedItem,
  enclosedThumb,
  enclosedTrack,
  fittedVariant,
  outlineThumb,
  outlineTrack,
  segmentedRoot,
  segmentedSizes,
} from "./segmented";

export const segmentGroup = defineSlotRecipe({
  className: "segment-group",
  slots: ["root", "label", "item", "itemText", "itemControl", "indicator"],
  base: {
    root: segmentedRoot,
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
      ...slidingIndicator,
      borderWidth: "1px",
      borderRadius: "lg",
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
          _unchecked: {
            _hover: {
              bg: "colorPalette.outline.bg.hover",
            },
          },
        },
        indicator: outlineThumb,
      },
    },
    size: segmentedSizes,
    fitted: fittedVariant,
  },
});
