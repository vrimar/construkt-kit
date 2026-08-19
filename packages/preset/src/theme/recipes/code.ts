import { defineRecipe } from "@pandacss/dev";

import { controlText } from "./control-size";
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
    gap: "1",
    lineHeight: "1",
  },
  defaultVariants: {
    size: "md",
    variant: "subtle",
  },
  variants: {
    variant: {
      solid: paletteVariant.solid,
      surface: paletteVariant.surface,
      subtle: paletteVariant.subtle,
      outline: paletteVariant.outline,
      plain: paletteVariant.plain,
    },
    size: {
      xs: { fontSize: "2xs", height: "4", minWidth: "4", px: "0.5" },
      sm: { ...controlText("xs"), height: "4.5", minWidth: "4.5", px: "1" },
      md: { ...controlText("sm"), height: "5", minWidth: "5", px: "1" },
      lg: { ...controlText("sm"), height: "5.5", minWidth: "5.5", px: "1" },
      xl: { ...controlText("lg"), height: "6", minWidth: "6", px: "1" },
    },
  },
});
