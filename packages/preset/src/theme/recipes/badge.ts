import { defineRecipe } from "@pandacss/dev";

import { controlFont, controlIcon, controlPx } from "./control-size";

export const badge = defineRecipe({
  className: "badge",
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "md",
    lineHeight: "1",
    fontWeight: "medium",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  defaultVariants: {
    variant: "subtle",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        bg: "colorPalette.solid.bg",
        color: "colorPalette.solid.fg",
      },
      surface: {
        bg: "colorPalette.surface.bg",
        borderWidth: "1px",
        borderColor: "colorPalette.surface.border",
        color: "colorPalette.surface.fg",
      },
      subtle: {
        bg: "colorPalette.subtle.bg",
        color: "colorPalette.subtle.fg",
      },
      outline: {
        borderWidth: "1px",
        borderColor: "colorPalette.outline.border",
        color: "colorPalette.outline.fg",
      },
    },
    size: {
      xs: { fontSize: "2xs", px: "1", h: "4", gap: "0.5", _icon: { boxSize: "2" } },
      sm: { fontSize: controlFont("xs"), px: "1", h: "4.5", gap: "0.5", _icon: { boxSize: "2.5" } },
      md: {
        fontSize: controlFont("xs"),
        px: controlPx("xs"),
        h: "5",
        gap: "1",
        _icon: { boxSize: "3" },
      },
      lg: {
        fontSize: controlFont("xs"),
        px: controlPx("sm"),
        h: "5.5",
        gap: "1",
        _icon: { boxSize: controlIcon("2xs") },
      },
      xl: {
        fontSize: controlFont("sm"),
        px: controlPx("sm"),
        h: "6",
        gap: "1.5",
        _icon: { boxSize: controlIcon("md") },
      },
      "2xl": {
        fontSize: controlFont("lg"),
        px: controlPx("md"),
        h: "7",
        gap: "1.5",
        _icon: { boxSize: "4.5" },
      },
    },
  },
});
