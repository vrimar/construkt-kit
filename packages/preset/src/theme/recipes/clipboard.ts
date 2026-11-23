import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";
import { fieldLabel } from "./field";

export const clipboard = defineSlotRecipe({
  className: "clipboard",
  slots: ["root", "control", "trigger", "indicator", "input", "label"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: surface("0.375rem"),
    },
    label: {
      ...fieldLabel,
      display: "inline-flex",
      alignItems: "center",
      gap: surface("0.125rem"),
    },
  },
});
