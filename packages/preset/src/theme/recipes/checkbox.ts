import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControl, checkboxControlSize } from "./checkbox-control";
import { solidCheckedFill } from "./choice-control";
import { type ControlSize, controlGap, controlText, touchRow } from "./control-size";
import { paletteVariant } from "./palette";

const tier = (size: ControlSize) => ({
  root: { gap: controlGap(size) },
  label: controlText(size),
  control: checkboxControlSize(size),
});

export const checkbox = defineSlotRecipe({
  className: "checkbox",
  slots: ["root", "label", "control", "group"],
  base: {
    root: {
      display: "inline-flex",
      gap: controlGap("md"),
      alignItems: "center",
      verticalAlign: "top",
      position: "relative",
      cursor: "pointer",
      _disabled: {
        layerStyle: "disabled",
      },
      ...touchRow(),
    },
    control: {
      ...checkboxControl,
      borderColor: "transparent",
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
    },
    group: {
      display: "flex",
      flexDirection: "column",
      gap: "3",
    },
  },

  defaultVariants: {
    variant: "solid",
    size: "md",
  },

  variants: {
    size: {
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
    },

    variant: {
      solid: {
        control: {
          borderColor: "border.control",
          _checked: solidCheckedFill,
          _indeterminate: solidCheckedFill,
        },
      },
      surface: { control: { ...paletteVariant.surface, borderColor: "colorPalette.control" } },
      subtle: { control: { ...paletteVariant.subtle, borderColor: "colorPalette.control" } },
      outline: {
        control: {
          ...paletteVariant.outline,
          borderColor: "colorPalette.control",
          _checked: { borderColor: "colorPalette.solid.bg" },
          _indeterminate: { borderColor: "colorPalette.solid.bg" },
        },
      },
      plain: { control: { ...paletteVariant.plain, borderColor: "border.control" } },
    },
  },
});
