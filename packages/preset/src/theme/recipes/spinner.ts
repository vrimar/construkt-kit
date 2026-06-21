import { defineRecipe } from "@pandacss/dev";

import { visual } from "./control-size";

export const spinner = defineRecipe({
  className: "spinner",
  base: {
    "--spinner-track-color": "transparent",
    animation: "spin",
    animationDuration: "slowest",
    borderBottomColor: "var(--spinner-track-color)",
    borderColor: "currentColor",
    borderInlineStartColor: "var(--spinner-track-color)",
    borderRadius: "full",
    borderStyle: "solid",
    borderWidth: "2px",
    display: "inline-block",
    height: "var(--spinner-size)",
    width: "var(--spinner-size)",
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      inherit: { "--spinner-size": "1em" },
      xs: { "--spinner-size": visual("0.75rem") },
      sm: { "--spinner-size": visual("1rem") },
      md: { "--spinner-size": visual("1.25rem") },
      lg: { "--spinner-size": visual("1.5rem") },
      xl: { "--spinner-size": visual("1.75rem") },
      "2xl": { "--spinner-size": visual("2rem") },
    },
  },
});
