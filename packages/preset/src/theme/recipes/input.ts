import type { RecipeConfig } from "@pandacss/types";

import { controlH, controlInputText, controlPx } from "./control-size";

const invalidRing = {
  focusRingColor: "border.error",
  borderColor: "border.error",
} as const;

const insetRing = {
  // "none" still defines --focus-ring-color, which focusRingColor feeds.
  focusVisibleRing: "none",
  _focusVisible: {
    borderColor: "var(--focus-ring-color)",
    boxShadow: "inset 0 0 0 1px var(--focus-ring-color)",
  },
} as const;

export const input = {
  className: "input",
  jsx: ["Input", "Field.Input", "SearchInput", "PasswordInput"],
  base: {
    appearance: "none",
    borderRadius: "md",
    height: "var(--input-height)",
    minHeight: "var(--input-height)",
    px: "var(--input-flushed-px, var(--input-px))",
    "--input-flushed-px": "initial",
    minW: "var(--input-height)",
    outline: "0",
    position: "relative",
    textAlign: "start",
    transition: "common",
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
        borderColor: "border.control",
        ...insetRing,
        _invalid: invalidRing,
      },
      surface: {
        bg: "neutral.surface.bg",
        borderWidth: "1px",
        borderColor: "border.control",
        ...insetRing,
        _invalid: invalidRing,
      },
      subtle: {
        borderWidth: "1px",
        borderColor: "transparent",
        bg: "neutral.subtle.bg",
        color: "neutral.subtle.fg",
        ...insetRing,
        _invalid: invalidRing,
      },
      flushed: {
        borderBottomWidth: "1px",
        borderBottomColor: "border.control",
        borderRadius: "0",
        color: "fg",
        "--input-flushed-px": "0",
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
        ...insetRing,
        focusRingColor: "colorPalette.solid.bg",
        _invalid: invalidRing,
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
        ...controlInputText("2xs"),
        "--input-px": controlPx("2xs"),
        "--input-height": controlH("2xs"),
      },
      xs: {
        ...controlInputText("xs"),
        "--input-px": controlPx("xs"),
        "--input-height": controlH("xs"),
      },
      sm: {
        ...controlInputText("sm"),
        "--input-px": controlPx("sm"),
        "--input-height": controlH("sm"),
      },
      md: {
        ...controlInputText("md"),
        "--input-px": controlPx("md"),
        "--input-height": controlH("md"),
      },
      lg: {
        ...controlInputText("lg"),
        "--input-px": controlPx("lg"),
        "--input-height": controlH("lg"),
      },
      xl: {
        ...controlInputText("xl"),
        "--input-px": controlPx("xl"),
        "--input-height": controlH("xl"),
      },
      "2xl": {
        ...controlInputText("2xl"),
        "--input-px": controlPx("2xl"),
        "--input-height": controlH("2xl"),
      },
    },
  },
} satisfies RecipeConfig;
