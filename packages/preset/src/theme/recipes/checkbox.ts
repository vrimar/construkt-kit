import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlGap, controlBox, controlText, touchRow } from "./control-size";
import { paletteVariant } from "./palette";

export const checkbox = defineSlotRecipe({
  className: "checkbox",
  slots: ["root", "label", "control", "group"],
  base: {
    root: {
      display: "inline-flex",
      gap: "2",
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
      ...checkboxControlBase,
      cursor: "inherit",
      borderColor: "transparent",
      borderRadius: "sm",
      _invalid: {
        outline: "2px solid",
        outlineColor: "border.error",
        outlineOffset: "2px",
      },
      focusVisibleRing: "outside",

      _icon: {
        boxSize: "full",
      },
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
      sm: {
        root: { gap: controlGap("sm") },
        label: controlText("sm"),
        control: { boxSize: controlBox("sm"), _icon: { boxSize: "2.5" } },
      },
      md: {
        root: { gap: controlGap("md") },
        label: controlText("md"),
        control: { boxSize: controlBox("md"), _icon: { boxSize: "3" } },
      },
      lg: {
        root: { gap: controlGap("lg") },
        label: controlText("lg"),
        control: { boxSize: controlBox("lg"), _icon: { boxSize: "3.5" } },
      },
    },

    variant: {
      solid: {
        control: {
          borderColor: "border.control",
          _checked: checkboxControlCheckedState,
          _indeterminate: checkboxControlCheckedState,
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
