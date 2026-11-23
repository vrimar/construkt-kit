import { defineSlotRecipe } from "@pandacss/dev";

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

export const toggleGroup = defineSlotRecipe({
  className: "toggle-group",
  slots: ["root", "item"],
  base: {
    root: {
      ...segmentedRoot,
      colorPalette: "neutral",
    },
    item: {
      alignItems: "center",
      appearance: "none",
      borderRadius: "lg",
      cursor: "pointer",
      display: "inline-flex",
      flexShrink: "0",
      fontWeight: "medium",
      gap: "2",
      justifyContent: "center",
      outline: "0",
      position: "relative",
      transition: "colors",
      userSelect: "none",
      verticalAlign: "middle",
      whiteSpace: "nowrap",
      focusVisibleRing: "outside",
      _icon: {
        flexShrink: "0",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
  variants: {
    variant: {
      outline: {
        root: outlineTrack,
        item: {
          borderWidth: "1px",
          borderColor: "transparent",
          color: "colorPalette.outline.fg",
          _hover: {
            bg: "colorPalette.outline.bg.hover",
          },
          _active: {
            bg: "colorPalette.outline.bg.active",
          },
          _pressed: outlineThumb,
        },
      },
      enclosed: {
        root: enclosedTrack,
        item: {
          ...enclosedItem("-1px", enclosedThumb),
          borderWidth: "1px",
          borderColor: "transparent",
          _hover: {
            bg: "neutral.subtle.bg.hover",
          },
        },
      },
      solid: {
        root: {
          borderRadius: "lg",
          bg: "neutral.subtle.bg",
          gap: "1",
          p: "1",
        },
        item: {
          color: "colorPalette.subtle.fg",
          _hover: {
            bg: "colorPalette.subtle.bg.hover",
          },
          _active: {
            bg: "colorPalette.subtle.bg.active",
          },
          _pressed: {
            bg: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
            _hover: {
              bg: "colorPalette.solid.bg.hover",
            },
            _active: {
              bg: "colorPalette.solid.bg.hover",
            },
          },
        },
      },
      subtle: {
        root: {
          borderRadius: "lg",
          gap: "1",
          p: "1",
        },
        item: {
          color: "colorPalette.plain.fg",
          _hover: {
            bg: "colorPalette.plain.bg.hover",
          },
          _active: {
            bg: "colorPalette.plain.bg.active",
          },
          _pressed: {
            bg: "colorPalette.subtle.bg.active",
            color: "colorPalette.subtle.fg",
            _active: {
              bg: "colorPalette.plain.bg.active",
            },
          },
        },
      },
    },
    size: segmentedSizes,
    fitted: fittedVariant,
  },
});
