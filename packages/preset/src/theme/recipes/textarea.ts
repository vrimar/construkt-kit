import { defineRecipe } from "@pandacss/dev";

import { controlPx, controlText } from "./control-size";

export const textarea = defineRecipe({
  className: "textarea",
  jsx: ["Textarea", "Field.Textarea"],
  base: {
    appearance: "none",
    borderRadius: "md",
    minWidth: "0",
    outline: "0",
    position: "relative",
    transition: "colors",
    width: "100%",
    _disabled: {
      layerStyle: "disabled",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        borderWidth: "1px",
        borderColor: "neutral.outline.border",
        focusVisibleRing: "inside",
        _invalid: {
          borderColor: "border.error",
          focusRingColor: "border.error",
        },
      },
      surface: {
        bg: "neutral.surface.bg",
        borderWidth: "1px",
        borderColor: "neutral.surface.border",
        focusVisibleRing: "inside",
        _invalid: {
          borderColor: "border.error",
          focusRingColor: "border.error",
        },
      },
      subtle: {
        borderWidth: "1px",
        borderColor: "transparent",
        bg: "neutral.subtle.bg",
        color: "neutral.subtle.fg",
        focusVisibleRing: "inside",
        _invalid: {
          borderColor: "border.error",
          focusRingColor: "border.error",
        },
      },
      flushed: {
        borderBottomWidth: "1px",
        borderBottomColor: "neutral.outline.border",
        borderRadius: "0",
        color: "fg",
        px: "0",
        _invalid: {
          borderColor: "border.error",
        },
        _focusVisible: {
          borderColor: "colorPalette.solid.bg",
          boxShadowColor: "colorPalette.solid.bg",
          boxShadow: "0 1px 0 0 var(--shadow-color)",
          _invalid: {
            borderColor: "border.error",
            boxShadowColor: "border.error",
          },
        },
      },
      colored: {
        borderWidth: "1px",
        borderColor: "colorPalette.outline.border",
        focusVisibleRing: "inside",
        focusRingColor: "colorPalette.solid.bg",
        _invalid: {
          borderColor: "border.error",
          focusRingColor: "border.error",
        },
      },
    },
    size: {
      xs: {
        ...controlText("xs"),
        px: controlPx("xs"),
        py: "5px",
        scrollPaddingBottom: "5px",
      },
      sm: {
        ...controlText("sm"),
        px: controlPx("sm"),
        py: "7px",
        scrollPaddingBottom: "7px",
      },
      md: {
        ...controlText("md"),
        px: controlPx("md"),
        py: "7px",
        scrollPaddingBottom: "7px",
      },
      lg: {
        ...controlText("lg"),
        px: controlPx("lg"),
        py: "9px",
        scrollPaddingBottom: "9px",
      },
      xl: {
        ...controlText("xl"),
        px: controlPx("xl"),
        py: "9px",
        scrollPaddingBottom: "9px",
      },
    },
  },
});
