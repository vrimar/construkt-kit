import { defineRecipe } from "@pandacss/dev";

import { type ControlSize, controlInputText, controlPx, controlPy } from "./control-size";
import { input } from "./input";

const tier = (size: ControlSize) => ({
  ...controlInputText(size),
  "--input-px": controlPx(size),
  py: controlPy(size),
  scrollPaddingBottom: controlPy(size),
});

export const textarea = defineRecipe({
  className: "textarea",
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
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
    },
  },
});
