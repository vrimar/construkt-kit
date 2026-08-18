import { defineRecipe } from "@pandacss/dev";

import { controlPx, controlText } from "./control-size";
import { input } from "./input";

export const textarea = defineRecipe({
  className: "textarea",
  jsx: ["Textarea", "Field.Textarea"],
  base: {
    appearance: "none",
    borderRadius: "md",
    minWidth: "0",
    outline: "0",
    position: "relative",
    transition: "colors",
    width: "100%",
    _disabled: {
      layerStyle: "disabled",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: input.variants.variant.outline,
      surface: input.variants.variant.surface,
      subtle: input.variants.variant.subtle,
      flushed: input.variants.variant.flushed,
      colored: input.variants.variant.colored,
    },
    size: {
      xs: {
        ...controlText("xs"),
        px: controlPx("xs"),
        py: "5px",
        scrollPaddingBottom: "5px",
      },
      sm: {
        ...controlText("sm"),
        px: controlPx("sm"),
        py: "7px",
        scrollPaddingBottom: "7px",
      },
      md: {
        ...controlText("md"),
        px: controlPx("md"),
        py: "7px",
        scrollPaddingBottom: "7px",
      },
      lg: {
        ...controlText("lg"),
        px: controlPx("lg"),
        py: "9px",
        scrollPaddingBottom: "9px",
      },
      xl: {
        ...controlText("xl"),
        px: controlPx("xl"),
        py: "9px",
        scrollPaddingBottom: "9px",
      },
    },
  },
});
