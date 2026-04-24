import { toggleGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const toggleGroup = defineSlotRecipe({
  className: "toggle-group",
  slots: toggleGroupAnatomy.keys(),
  base: {
    root: {},
  },
  defaultVariants: {
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        root: {
          borderRadius: "lg",
          borderWidth: "1px",
          gap: "1",
          p: "1",
        },
      },
      solid: {
        root: {
          borderRadius: "lg",
          bg: "neutral.subtle.bg",
          gap: "1",
          p: "1",
        },
      },
      subtle: {
        root: {
          borderRadius: "lg",
          gap: "1",
          p: "1",
        },
      },
    },
  },
});
