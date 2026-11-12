import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlPx, controlText } from "./control-size";

export const actionbar = defineSlotRecipe({
  className: "actionbar",
  slots: [
    "positioner",
    "content",
    "separator",
    "selectionTrigger",
    "closeTrigger",
    "lead",
    "scope",
  ],
  base: {
    positioner: {
      display: "flex",
      pointerEvents: "none",
    },
    content: {
      display: "flex",
      alignItems: "center",
      pointerEvents: "auto",
    },
    separator: {
      width: "1px",
      alignSelf: "stretch",
      bg: "border",
    },
    selectionTrigger: {
      ...controlText("sm"),
      color: "fg.muted",
      cursor: "pointer",
    },
    closeTrigger: {
      cursor: "pointer",
      color: "fg.muted",
      _hover: { color: "fg" },
    },
    lead: {
      ...controlText("sm"),
      flex: "0 1 auto",
      minW: "14",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: "semibold",
    },
    scope: {
      ms: "2",
      ...controlText("xs"),
      fontWeight: "normal",
      color: "fg.muted",
    },
  },
  defaultVariants: {
    placement: "bottom",
  },
  variants: {
    placement: {
      bottom: {
        positioner: {
          position: "fixed",
          insetInline: "0",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + {spacing.6})",
          justifyContent: "center",
          zIndex: "banner",
        },
        content: {
          gap: "3",
          bg: "bg",
          borderRadius: "lg",
          boxShadow: "lg",
          px: controlPx("md"),
          py: controlGap("xl"),
        },
      },
      inline: {
        positioner: {
          position: "absolute",
          inset: "0",
          zIndex: "3",
        },
        content: {
          flex: "1",
          minW: "0",
          gap: "1",
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
          px: controlPx("md"),
        },
      },
    },
  },
});
