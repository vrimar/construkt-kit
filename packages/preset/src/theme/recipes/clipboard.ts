import { clipboardAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

export const clipboard = defineSlotRecipe({
  className: "clipboard",
  slots: clipboardAnatomy.keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: surface("0.375rem"),
    },
    label: {
      display: "inline-flex",
      alignItems: "center",
      fontWeight: "medium",
      textStyle: "sm",
      color: "fg",
      gap: surface("0.125rem"),
    },
  },
});
