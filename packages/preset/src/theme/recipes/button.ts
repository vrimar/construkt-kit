import { defineRecipe } from "@pandacss/dev";

import { controlH, controlPx, controlGap, controlIcon, controlText } from "./control-size";

export const button = defineRecipe({
  className: "button",
  jsx: [
    "Button",
    "IconButton",
    "CloseButton",
    "DeleteButton",
    "EditButton",
    "SelectButton",
    "TooltipIconButton",
  ],
  base: {
    alignItems: "center",
    appearance: "none",
    borderRadius: "md",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: "0",
    fontWeight: "semibold",
    isolation: "isolate",
    justifyContent: "center",
    outline: "0",
    position: "relative",
    transition: "colors",
    userSelect: "none",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    _icon: {
      flexShrink: "0",
    },
    _disabled: {
      layerStyle: "disabled",
      "&[data-loading]": {
        filter: "none",
        opacity: "1",
      },
    },
    focusVisibleRing: "outside",
    colorPalette: "neutral",
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        bg: "colorPalette.solid.bg",
        color: "colorPalette.solid.fg",
        _hover: {
          bg: "colorPalette.solid.bg.hover",
        },
        _open: {
          bg: "colorPalette.solid.bg.hover",
        },
      },
      surface: {
        bg: "colorPalette.surface.bg",
        borderWidth: "1px",
        borderColor: "colorPalette.surface.border",
        color: "colorPalette.surface.fg",
        _hover: {
          borderColor: "colorPalette.surface.border.hover",
        },
        _active: {
          bg: "colorPalette.surface.bg.active",
        },
        _open: {
          bg: "colorPalette.surface.bg.hover",
        },
        _on: {
          bg: "colorPalette.surface.bg.active",
        },
      },
      subtle: {
        bg: "colorPalette.subtle.bg",
        color: "colorPalette.subtle.fg",
        _hover: {
          bg: "colorPalette.subtle.bg.hover",
        },
        _active: {
          bg: "colorPalette.subtle.bg.active",
        },
        _open: {
          bg: "colorPalette.subtle.bg.hover",
        },
        _on: {
          bg: "colorPalette.subtle.bg.active",
        },
      },
      outline: {
        borderWidth: "1px",
        borderColor: "colorPalette.outline.border",
        color: "colorPalette.outline.fg",
        _hover: {
          bg: "colorPalette.outline.bg.hover",
        },
        _active: {
          bg: "colorPalette.outline.bg.active",
        },
        _open: {
          bg: "colorPalette.outline.bg.hover",
        },
        _on: {
          bg: "colorPalette.outline.bg.active",
        },
      },
      plain: {
        color: "colorPalette.plain.fg",
        _hover: {
          bg: "colorPalette.plain.bg.hover",
        },
        _open: {
          bg: "colorPalette.plain.bg.hover",
        },
        _active: {
          bg: "colorPalette.plain.bg.active",
        },
        _on: {
          bg: "colorPalette.plain.bg.active",
        },
      },
    },
    size: {
      "2xs": {
        h: controlH("2xs"),
        minW: controlH("2xs"),
        ...controlText("2xs"),
        px: controlPx("2xs"),
        gap: controlGap("2xs"),
        _icon: { boxSize: controlIcon("2xs") },
      },
      xs: {
        h: controlH("xs"),
        minW: controlH("xs"),
        ...controlText("xs"),
        px: controlPx("xs"),
        gap: controlGap("xs"),
        _icon: { boxSize: controlIcon("xs") },
      },
      sm: {
        h: controlH("sm"),
        minW: controlH("sm"),
        ...controlText("sm"),
        px: controlPx("sm"),
        gap: controlGap("sm"),
        _icon: { boxSize: controlIcon("sm") },
      },
      md: {
        h: controlH("md"),
        minW: controlH("md"),
        ...controlText("md"),
        px: controlPx("md"),
        gap: controlGap("md"),
        _icon: { boxSize: controlIcon("md") },
      },
      lg: {
        h: controlH("lg"),
        minW: controlH("lg"),
        ...controlText("lg"),
        px: controlPx("lg"),
        gap: controlGap("lg"),
        _icon: { boxSize: controlIcon("lg") },
      },
      xl: {
        h: controlH("xl"),
        minW: controlH("xl"),
        ...controlText("xl"),
        px: controlPx("xl"),
        gap: controlGap("xl"),
        _icon: { boxSize: controlIcon("xl") },
      },
      "2xl": {
        h: controlH("2xl"),
        minW: controlH("2xl"),
        ...controlText("2xl"),
        px: controlPx("2xl"),
        gap: controlGap("2xl"),
        _icon: { boxSize: controlIcon("2xl") },
      },
    },
  },
});
