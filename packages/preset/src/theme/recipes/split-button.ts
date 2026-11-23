import { defineRecipe } from "@pandacss/dev";

const divided = {
  "& > * + *": {
    _before: {
      content: '""',
      position: "absolute",
      insetBlock: "0",
      insetInlineStart: "0",
      width: "1px",
      bg: "currentColor",
      opacity: "0.35",
      pointerEvents: "none",
    },
  },
};

export const splitButton = defineRecipe({
  className: "split-button",
  base: {
    minW: "0",
    maxW: "full",
    // Kept in the recipe layer so an enclosing attached group can square it for the parts to inherit.
    borderRadius: "md",
    "& > :first-child": { borderStartRadius: "inherit" },
    "& > :last-child": { borderEndRadius: "inherit" },
  },
  defaultVariants: {
    variant: "solid",
  },
  variants: {
    variant: {
      solid: divided,
      surface: {},
      subtle: divided,
      outline: {},
      plain: divided,
    },
  },
});
