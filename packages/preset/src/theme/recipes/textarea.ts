import { defineRecipe } from "@pandacss/dev";

import { controlPx, controlPy, controlText } from "./control-size";
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
        py: controlPy("xs"),
        scrollPaddingBottom: controlPy("xs"),
      },
      sm: {
        ...controlText("sm"),
        px: controlPx("sm"),
        py: controlPy("sm"),
        scrollPaddingBottom: controlPy("sm"),
      },
      md: {
        ...controlText("md"),
        px: controlPx("md"),
        py: controlPy("md"),
        scrollPaddingBottom: controlPy("md"),
      },
      lg: {
        ...controlText("lg"),
        px: controlPx("lg"),
        py: controlPy("lg"),
        scrollPaddingBottom: controlPy("lg"),
      },
      xl: {
        ...controlText("xl"),
        px: controlPx("xl"),
        py: controlPy("xl"),
        scrollPaddingBottom: controlPy("xl"),
      },
    },
  },
});
