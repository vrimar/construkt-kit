import { defineRecipe } from "@pandacss/dev";

import { inlineCodeSize } from "./control-size";
import { paletteVariant } from "./palette";

export const code = defineRecipe({
  className: "code",
  base: {
    alignItems: "center",
    borderRadius: "md",
    display: "inline-flex",
    fontVariantNumeric: "tabular-nums",
    fontWeight: "medium",
    fontFamily: "mono",
    fontFeatureSettings: "normal",
    gap: "1",
    lineHeight: "1",
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
