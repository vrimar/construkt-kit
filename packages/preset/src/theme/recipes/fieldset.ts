import { fieldsetAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

const sectionGap = { base: surface("1.25rem"), md: surface("2rem") };

export const fieldset = defineSlotRecipe({
  className: "fieldset",
  slots: fieldsetAnatomy.extendWith("content", "control").keys(),
  base: {
    root: {
      display: "flex",
      width: "full",
      flexDirection: "column",
      gap: sectionGap,
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
      mb: sectionGap,
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
