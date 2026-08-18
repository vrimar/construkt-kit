import { defineRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlH,
  controlPx,
  controlGap,
  controlIcon,
  controlText,
} from "./control-size";

const tier = (size: ControlSize) => ({
  h: controlH(size),
  minW: controlH(size),
  ...controlText(size),
  px: controlPx(size),
  gap: controlGap(size),
  _icon: { boxSize: controlIcon(size) },
});

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
      "2xs": tier("2xs"),
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
      "2xl": tier("2xl"),
    },
  },
});
