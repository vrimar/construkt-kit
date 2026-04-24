import { clipboardAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const clipboard = defineSlotRecipe({
  className: "clipboard",
  slots: clipboardAnatomy.keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "1.5",
    },
    label: {
      display: "inline-flex",
      alignItems: "center",
      fontWeight: "medium",
      textStyle: "sm",
      color: "fg",
      gap: "0.5",
    },
  },
});
