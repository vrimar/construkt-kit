import { defineSlotRecipe } from "@pandacss/dev";

import { controlH } from "./control-size";
import { fieldLabel } from "./field";
import { input, inputSlotVariants } from "./input";

type NumberInputSize = "sm" | "md" | "lg" | "xl";

const tier = (size: NumberInputSize, stepperWidth: string) => ({
  root: {
    "--number-input-height": controlH(size),
    "--stepper-width": stepperWidth,
  },
  input: input.variants.size[size],
});

const trigger = {
  alignItems: "center",
  color: "fg.muted",
  cursor: "pointer",
  display: "flex",
  flex: "1",
  justifyContent: "center",
  lineHeight: "1",
  transition: "common",
  userSelect: "none",
  _icon: {
    boxSize: "1em",
  },
  _hover: {
    bg: "neutral.surface.bg.hover",
  },
  _active: {
    bg: "neutral.surface.bg.active",
  },
  _disabled: {
    cursor: "not-allowed",
  },
};

export const numberInput = defineSlotRecipe({
  className: "number-input",
  slots: ["root", "label", "input", "control", "incrementTrigger", "decrementTrigger", "scrubber"],
  base: {
    root: {
      isolation: "isolate",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    control: {
      borderStartWidth: "1px",
      display: "flex",
      divideY: "1px",
      flexDirection: "column",
      bottom: "0",
      height: "calc(var(--number-input-height) - 2px)",
      insetEnd: "0px",
      margin: "1px",
      position: "absolute",
      width: "var(--stepper-width)",
      zIndex: "1",
    },
    input: {
      ...input.base,
      verticalAlign: "top",
      pe: "calc(var(--stepper-width) + 0.5rem)",
      // The root dims the whole control; dimming the input too would compound.
      _disabled: {
        cursor: "not-allowed",
      },
    },
    label: fieldLabel,
    incrementTrigger: {
      ...trigger,
      borderStartEndRadius: "md",
    },
    decrementTrigger: {
      ...trigger,
      borderEndEndRadius: "md",
    },
    scrubber: {
      cursor: "ew-resize",
      _disabled: { cursor: "inherit" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    size: {
      sm: tier("sm", "sizes.4"),
      md: tier("md", "sizes.4.5"),
      lg: tier("lg", "sizes.5"),
      xl: tier("xl", "sizes.5.5"),
    },
    variant: inputSlotVariants("input", ["outline", "surface"]),
  },
});
