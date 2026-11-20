import { defineRecipe } from "@pandacss/dev";

import { inlineCodeSize } from "./control-size";
import { paletteVariant } from "./palette";

export const kbd = defineRecipe({
  className: "kbd",
  base: {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "medium",
    fontFamily: "mono",
    fontFeatureSettings: "normal",
    flexShrink: "0",
    whiteSpace: "nowrap",
    wordSpacing: "-0.25em",
    userSelect: "none",
    borderRadius: "md",
    justifyContent: "center",
  },

  defaultVariants: {
    size: "md",
    variant: "subtle",
  },

  variants: {
    variant: paletteVariant,
    size: inlineCodeSize,
  },
});
