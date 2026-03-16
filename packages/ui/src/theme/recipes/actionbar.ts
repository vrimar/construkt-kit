import { defineSlotRecipe } from "@pandacss/dev";

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
      px: "3",
      py: "2.5",
    },
    separator: {
      width: "1px",
      alignSelf: "stretch",
      bg: "border",
    },
    selectionTrigger: {
      textStyle: "sm",
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
