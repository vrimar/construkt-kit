import { ratingGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { visual } from "./control-size";

export const ratingGroup = defineSlotRecipe({
  className: "rating-group",
  slots: ratingGroupAnatomy.extendWith("itemIndicator").keys(),
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
      "--clip-path": { base: "inset(0 50% 0 0)", _rtl: "inset(0 0 0 50%)" },
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
      "& [data-bg]": {
        color: "colorPalette.subtle.bg",
      },
      "& [data-fg]": {
        color: "transparent",
      },
      "&[data-highlighted]:not([data-half])": {
        "& [data-fg]": {
          color: "colorPalette.solid.bg",
        },
      },
      "&[data-half]": {
        "& [data-fg]": {
          color: "colorPalette.solid.bg",
          clipPath: "var(--clip-path)",
        },
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
