import { defineRecipe } from "@chakra-ui/react";

export const inputRecipe = defineRecipe({
  variants: {
    variant: {
      outline: {
        bg: "bg",
      },
      flushed: {
        borderBottomWidth: "0px",
        borderBottomColor: "none",
        _focusVisible: {
          borderBottomWidth: "0px",
          borderBottomColor: "none",
          boxShadow: "none",
        },
      },
    },
  },
});
