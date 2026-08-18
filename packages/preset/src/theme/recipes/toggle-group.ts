import { toggleGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlH, controlPx, controlIcon, controlText } from "./control-size";

const tier = (size: ControlSize) => ({
  item: {
    h: controlH(size),
    minW: controlH(size),
    ...controlText(size),
    px: controlPx(size),
    _icon: { boxSize: controlIcon(size) },
  },
});

export const toggleGroup = defineSlotRecipe({
  className: "toggle-group",
  jsx: ["ToggleGroup", /ToggleGroup\..+/],
  slots: toggleGroupAnatomy.keys(),
  base: {
    root: {
      colorPalette: "neutral",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      isolation: "isolate",
      position: "relative",
      maxWidth: "100%",
      overflowX: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      _vertical: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
    item: {
      alignItems: "center",
      appearance: "none",
      borderRadius: "lg",
      cursor: "pointer",
      display: "inline-flex",
      flexShrink: "0",
      fontWeight: "semibold",
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
        root: {
          borderRadius: "lg",
          borderWidth: "1px",
          borderColor: "neutral.surface.border",
          gap: "1",
          p: "1",
        },
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
          _on: {
            bg: "colorPalette.outline.bg.active",
            borderColor: "colorPalette.outline.border",
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
          _on: {
            bg: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
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
          _on: {
            bg: "colorPalette.subtle.bg.active",
            color: "colorPalette.subtle.fg",
          },
        },
      },
    },
    size: {
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
    },
    fitted: {
      true: {
        root: {
          display: "flex",
        },
        item: {
          flex: "1",
        },
      },
    },
  },
});
