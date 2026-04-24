import { defineRecipe } from "@pandacss/dev";

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
      xs: { textStyle: "sm", px: "2", py: "5px", scrollPaddingBottom: "5px" },
      sm: { textStyle: "sm", px: "2.5", py: "7px", scrollPaddingBottom: "7px" },
      md: { textStyle: "md", px: "3", py: "7px", scrollPaddingBottom: "7px" },
      lg: { textStyle: "md", px: "3.5", py: "9px", scrollPaddingBottom: "9px" },
      xl: { textStyle: "lg", px: "4", py: "9px", scrollPaddingBottom: "9px" },
    },
  },
});
