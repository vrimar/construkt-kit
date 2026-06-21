import type { RecipeConfig } from "@pandacss/dev";

import { controlH, controlPx, controlText } from "./control-size";

export const input = {
  className: "input",
  jsx: ["Input", "Field.Input", "SearchInput", "PasswordInput"],
  base: {
    appearance: "none",
    borderRadius: "md",
    height: "var(--input-height)",
    minHeight: "var(--input-height)",
    minW: "var(--input-height)",
    outline: "0",
    position: "relative",
    textAlign: "start",
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
          focusRingColor: "border.error",
          borderColor: "border.error",
        },
      },
      surface: {
        bg: "neutral.surface.bg",
        borderWidth: "1px",
        borderColor: "neutral.surface.border",
        focusVisibleRing: "inside",

        _invalid: {
          focusRingColor: "border.error",
          borderColor: "border.error",
        },
      },
      subtle: {
        borderWidth: "1px",
        borderColor: "transparent",
        bg: "neutral.subtle.bg",
        color: "neutral.subtle.fg",
        focusVisibleRing: "inside",

        _invalid: {
          focusRingColor: "border.error",
          borderColor: "border.error",
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
          focusRingColor: "border.error",
          borderColor: "border.error",
        },
      },
      plain: {
        focusVisibleRing: "none",
        _invalid: {
          focusRingColor: "border.error",
        },
      },
    },
    size: {
      "2xs": {
        ...controlText("2xs"),
        px: controlPx("2xs"),
        "--input-height": controlH("2xs"),
      },
      xs: { ...controlText("xs"), px: controlPx("xs"), "--input-height": controlH("xs") },
      sm: { ...controlText("sm"), px: controlPx("sm"), "--input-height": controlH("sm") },
      md: { ...controlText("md"), px: controlPx("md"), "--input-height": controlH("md") },
      lg: { ...controlText("lg"), px: controlPx("lg"), "--input-height": controlH("lg") },
      xl: { ...controlText("xl"), px: controlPx("xl"), "--input-height": controlH("xl") },
      "2xl": {
        ...controlText("2xl"),
        px: controlPx("2xl"),
        "--input-height": controlH("2xl"),
      },
    },
  },
} satisfies RecipeConfig;
