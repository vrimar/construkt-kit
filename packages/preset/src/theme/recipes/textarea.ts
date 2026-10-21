import { defineRecipe } from "@pandacss/dev";

import { controlInputText, controlPx, controlPy } from "./control-size";
import { input } from "./input";

export const textarea = defineRecipe({
  className: "textarea",
  jsx: ["Textarea", "Field.Textarea"],
  base: {
    appearance: "none",
    borderRadius: "md",
    minWidth: "0",
    outline: "0",
    px: "var(--input-flushed-px, var(--input-px))",
    "--input-flushed-px": "initial",
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
      plain: input.variants.variant.plain,
    },
    size: {
      xs: {
        ...controlInputText("xs"),
        "--input-px": controlPx("xs"),
        py: controlPy("xs"),
        scrollPaddingBottom: controlPy("xs"),
      },
      sm: {
        ...controlInputText("sm"),
        "--input-px": controlPx("sm"),
        py: controlPy("sm"),
        scrollPaddingBottom: controlPy("sm"),
      },
      md: {
        ...controlInputText("md"),
        "--input-px": controlPx("md"),
        py: controlPy("md"),
        scrollPaddingBottom: controlPy("md"),
      },
      lg: {
        ...controlInputText("lg"),
        "--input-px": controlPx("lg"),
        py: controlPy("lg"),
        scrollPaddingBottom: controlPy("lg"),
      },
      xl: {
        ...controlInputText("xl"),
        "--input-px": controlPx("xl"),
        py: controlPy("xl"),
        scrollPaddingBottom: controlPy("xl"),
      },
    },
  },
});
