import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlIcon, controlPx, controlText } from "./control-size";

export const alert = defineSlotRecipe({
  className: "alert",
  slots: ["root", "content", "description", "indicator", "title"],
  base: {
    root: {
      alignItems: "flex-start",
      borderRadius: "lg",
      display: "flex",
      position: "relative",
      width: "full",
    },
    content: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
      gap: "1",
    },
    description: {
      display: "inline",
    },
    indicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
    },
    title: {
      fontWeight: "semibold",
    },
  },
  defaultVariants: {
    size: "md",
    status: "info",
    variant: "subtle",
  },
  variants: {
    size: {
      sm: {
        root: {
          gap: controlGap("md"),
          p: controlPx("md"),
          ...controlText("xs"),
        },
        indicator: {
          _icon: {
            width: controlIcon("md"),
            height: controlIcon("md"),
          },
        },
      },
      md: {
        root: {
          gap: controlGap("2xl"),
          p: controlPx("xl"),
          ...controlText("sm"),
        },
        indicator: {
          _icon: {
            width: controlIcon("lg"),
            height: controlIcon("lg"),
          },
        },
      },
      lg: {
        root: {
          gap: "4",
          p: controlPx("xl"),
          ...controlText("lg"),
        },
        indicator: {
          _icon: {
            width: controlIcon("2xl"),
            height: controlIcon("2xl"),
          },
        },
      },
    },
    variant: {
      solid: {
        root: {
          bg: "colorPalette.solid.bg",
          color: "colorPalette.solid.fg",
        },
      },
      surface: {
        root: {
          bg: "colorPalette.surface.bg",
          borderWidth: "1px",
          borderColor: "colorPalette.surface.border",
          color: "colorPalette.surface.fg",
        },
      },
      subtle: {
        root: {
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
        },
      },
      outline: {
        root: {
          borderWidth: "1px",
          borderColor: "colorPalette.outline.border",
          color: "colorPalette.outline.fg",
        },
      },
    },
    status: {
      info: {
        root: { colorPalette: "blue" },
      },
      warning: {
        root: { colorPalette: "orange" },
      },
      success: {
        root: { colorPalette: "green" },
      },
      error: {
        root: { colorPalette: "red" },
      },
      neutral: {
        root: { colorPalette: "neutral" },
      },
    },
  },
});
