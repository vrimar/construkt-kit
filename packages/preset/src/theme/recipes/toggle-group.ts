import { toggleGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

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
      xs: { item: { h: "8", minW: "8", textStyle: "sm", px: "2.5", _icon: { boxSize: "4" } } },
      sm: { item: { h: "9", minW: "9", textStyle: "sm", px: "3", _icon: { boxSize: "4" } } },
      md: { item: { h: "10", minW: "10", textStyle: "sm", px: "3.5", _icon: { boxSize: "5" } } },
      lg: { item: { h: "11", minW: "11", textStyle: "md", px: "4", _icon: { boxSize: "5" } } },
      xl: { item: { h: "12", minW: "12", textStyle: "md", px: "4.5", _icon: { boxSize: "5.5" } } },
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
