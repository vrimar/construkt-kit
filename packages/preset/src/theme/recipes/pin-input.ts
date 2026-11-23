import { defineSlotRecipe } from "@pandacss/dev";

import { input, inputSlotSizes, inputSlotVariants } from "./input";

export const pinInput = defineSlotRecipe({
  className: "pin-input",
  slots: ["root", "label", "input", "control"],
  base: {
    input: {
      ...input.base,
      textAlign: "center",
      width: "var(--input-height)",
      px: "1!",
    },
    control: {
      display: "inline-flex",
      gap: "2",
      isolation: "isolate",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    size: inputSlotSizes("input", ["xs", "sm", "md", "lg", "xl", "2xl"]),
    variant: inputSlotVariants("input", ["outline", "subtle", "flushed"]),
  },
});
