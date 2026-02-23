import { defineSlotRecipe } from "@chakra-ui/react";

export const popoverRecipe = defineSlotRecipe({
  slots: [],
  base: {
    content: {
      border: "solid 1px",
      borderColor: "border.muted",
      borderRadius: "4px",
      boxShadow: "xl",
    },
  },
});
