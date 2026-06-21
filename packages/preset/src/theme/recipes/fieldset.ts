import { fieldsetAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

export const fieldset = defineSlotRecipe({
  className: "fieldset",
  slots: fieldsetAnatomy.extendWith("content", "control").keys(),
  base: {
    root: {
      display: "flex",
      justifyContent: "space-between",
      width: "full",
      flexDirection: { base: "column", md: "row" },
      gap: { base: surface("1.25rem"), md: surface("2rem") },
    },
    control: {
      maxW: "xs",
      display: "flex",
      flexDirection: "column",
      width: "full",
      gap: surface("0.25rem"),
    },
    content: {
      display: "flex",
      flexDirection: "column",
      width: "full",
      maxW: "2xl",
      gap: surface("1rem"),
    },
    legend: {
      color: "fg",
      fontWeight: "semibold",
    },
    helperText: {
      color: "fg.muted",
      textStyle: "sm",
    },
    errorText: {
      display: "inline-flex",
      alignItems: "center",
      color: "fg.error",
      gap: surface("0.5rem"),
      fontWeight: "medium",
      textStyle: "sm",
    },
  },
});
