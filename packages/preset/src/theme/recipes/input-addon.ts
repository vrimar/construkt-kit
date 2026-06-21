import { defineRecipe } from "@pandacss/dev";

import { controlPx, controlIcon, controlText } from "./control-size";

export const inputAddon = defineRecipe({
  className: "input-addon",
  base: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: "md",
    color: "fg.muted",
    display: "flex",
    flex: "0 0 auto",
    whiteSpace: "nowrap",
    width: "auto",
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        borderWidth: "1px",
        borderColor: "neutral.outline.border",
      },
      surface: {
        bg: "neutral.surface.bg",
        borderWidth: "1px",
        borderColor: "neutral.surface.border",
      },
      subtle: {
        bg: "neutral.subtle.bg",
      },
    },
    size: {
      xs: {
        ...controlText("xs"),
        px: controlPx("xs"),
        _icon: { boxSize: controlIcon("xs") },
      },
      sm: {
        ...controlText("sm"),
        px: controlPx("sm"),
        _icon: { boxSize: controlIcon("sm") },
      },
      md: {
        ...controlText("md"),
        px: controlPx("md"),
        _icon: { boxSize: controlIcon("md") },
      },
      lg: {
        ...controlText("lg"),
        px: controlPx("lg"),
        _icon: { boxSize: controlIcon("lg") },
      },
      xl: {
        ...controlText("xl"),
        px: controlPx("xl"),
        _icon: { boxSize: controlIcon("xl") },
      },
    },
  },
});
