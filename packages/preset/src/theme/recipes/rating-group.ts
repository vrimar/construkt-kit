import { defineSlotRecipe } from "@pandacss/dev";

import { visual } from "./control-size";

export const ratingGroup = defineSlotRecipe({
  className: "rating-group",
  slots: [
    "root",
    "label",
    "item",
    "control",
    "itemIndicator",
    "itemIndicatorBg",
    "itemIndicatorFg",
  ],
  base: {
    root: {
      alignItems: "center",
      display: "inline-flex",
      verticalAlign: "top",
    },
    control: {
      alignItems: "center",
      display: "inline-flex",
      gap: "0.5",
    },
    item: {
      alignItems: "center",
      display: "inline-flex",
      justifyContent: "center",
      userSelect: "none",
      cursor: "pointer",
      _disabled: {
        layerStyle: "disabled",
      },
      _readOnly: {
        cursor: "default",
        _disabled: {
          cursor: "not-allowed",
        },
      },
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
    },
    itemIndicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      "--rating-half-clip": { base: "inset(0 50% 0 0)", _rtl: "inset(0 0 0 50%)" },
      _icon: {
        stroke: "currentColor",
        display: "inline-block",
        flexShrink: 0,
        position: "absolute",
        width: "inherit",
        height: "inherit",
        left: 0,
        top: 0,
      },
    },
    itemIndicatorBg: {
      color: "colorPalette.subtle.bg",
    },
    itemIndicatorFg: {
      color: "transparent",
      _highlighted: {
        color: "colorPalette.solid.bg",
      },
      _half: {
        clipPath: "var(--rating-half-clip)",
      },
    },
  },

  defaultVariants: {
    size: "md",
  },

  variants: {
    size: {
      xs: { root: { gap: "2" }, itemIndicator: { width: visual("1rem"), height: visual("1rem") } },
      sm: {
        root: { gap: "2" },
        itemIndicator: { width: visual("1.125rem"), height: visual("1.125rem") },
      },
      md: {
        root: { gap: "3" },
        itemIndicator: { width: visual("1.25rem"), height: visual("1.25rem") },
      },
      lg: {
        root: { gap: "3" },
        itemIndicator: { width: visual("1.375rem"), height: visual("1.375rem") },
      },
      xl: {
        root: { gap: "3" },
        itemIndicator: { width: visual("1.5rem"), height: visual("1.5rem") },
      },
    },
  },
});
