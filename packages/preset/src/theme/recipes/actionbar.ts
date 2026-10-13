import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlPx, controlText } from "./control-size";

export const actionbar = defineSlotRecipe({
  className: "actionbar",
  slots: ["positioner", "content", "separator", "selectionTrigger", "closeTrigger"],
  base: {
    positioner: {
      position: "fixed",
      insetInline: "0",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + {spacing.6})",
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: "banner",
    },
    content: {
      display: "flex",
      alignItems: "center",
      gap: "3",
      bg: "bg",
      borderRadius: "lg",
      boxShadow: "lg",
      px: controlPx("md"),
      py: controlGap("xl"),
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
  },
});
