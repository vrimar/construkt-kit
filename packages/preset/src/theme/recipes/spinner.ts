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
    variant: "ring",
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
    variant: {
      ring: {},
      dots: {
        animation: "none",
        borderWidth: "0",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "auto",
        "& > span": {
          boxSize: "calc(var(--spinner-size) / 5)",
          borderRadius: "full",
          bg: "currentColor",
          animationStyle: "blink",
          animationTimingFunction: "ease-in-out",
        },
        "& > span:nth-child(2)": { animationDelay: "0.15s" },
        "& > span:nth-child(3)": { animationDelay: "0.3s" },
      },
    },
  },
});
