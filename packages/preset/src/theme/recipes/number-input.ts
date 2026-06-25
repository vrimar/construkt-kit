import { numberInputAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH } from "./control-size";
import { input } from "./input";

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
};

export const numberInput = defineSlotRecipe({
  className: "number-input",
  slots: numberInputAnatomy.keys(),
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
    },
    label: {
      color: "fg",
      fontWeight: "medium",
    },
    incrementTrigger: {
      ...trigger,
      borderTopEndRadius: "md",
    },
    decrementTrigger: {
      ...trigger,
      borderBottomEndRadius: "md",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    size: {
      sm: {
        control: {
          "--number-input-height": controlH("sm"),
          "--stepper-width": "sizes.4",
        },
        input: input.variants.size.sm,
      },
      md: {
        control: {
          "--number-input-height": controlH("md"),
          "--stepper-width": "sizes.4.5",
        },
        input: input.variants.size.md,
      },
      lg: {
        control: {
          "--number-input-height": controlH("lg"),
          "--stepper-width": "sizes.5",
        },
        input: input.variants.size.lg,
      },
      xl: {
        control: {
          "--number-input-height": controlH("xl"),
          "--stepper-width": "sizes.5.5",
        },
        input: input.variants.size.xl,
      },
    },
    variant: {
      outline: {
        input: input.variants.variant.outline,
      },
      surface: {
        input: input.variants.variant.surface,
      },
    },
  },
});
