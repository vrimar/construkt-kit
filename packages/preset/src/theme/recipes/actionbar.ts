import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlPx, controlText } from "./control-size";

export const actionbar = defineSlotRecipe({
  className: "actionbar",
  slots: ["content", "separator", "selectionTrigger", "closeTrigger"],
  base: {
    content: {
      display: "flex",
      alignItems: "center",
      gap: "3",
      bg: "bg",
      borderRadius: "lg",
      boxShadow: "lg",
      px: controlPx("md"),
      py: controlGap("xl"),
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
