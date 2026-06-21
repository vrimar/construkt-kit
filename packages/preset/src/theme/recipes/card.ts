import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

export const card = defineSlotRecipe({
  className: "card",
  slots: ["root", "header", "body", "footer", "title", "description"],
  base: {
    root: {
      colorPalette: "neutral",
      borderRadius: "lg",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: surface("0.25rem"),
      p: surface("1.5rem"),
    },
    body: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
      pb: surface("1.5rem"),
      px: surface("1.5rem"),
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: surface("0.75rem"),
      pb: surface("1.5rem"),
      pt: surface("0.5rem"),
      px: surface("1.5rem"),
    },
    title: {
      textStyle: "lg",
      fontWeight: "semibold",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
  },
  defaultVariants: {
    variant: "outline",
  },
  variants: {
    variant: {
      elevated: {
        root: {
          bg: "colorPalette.surface.bg",
          boxShadow: "lg",
        },
      },
      outline: {
        root: {
          bg: "colorPalette.surface.bg",
          borderWidth: "1px",
        },
      },
      subtle: {
        root: {
          bg: "colorPalette.subtle.bg",
        },
      },
    },
  },
});
