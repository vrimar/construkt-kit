import { defineRecipe } from "@pandacss/dev";

export const heading = defineRecipe({
  className: "heading",
  base: {
    fontFamily: "heading",
    fontWeight: "semibold",
  },
});
