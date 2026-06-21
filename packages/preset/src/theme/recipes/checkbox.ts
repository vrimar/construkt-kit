import { checkboxAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlGap, controlBox, controlText } from "./control-size";

export const checkbox = defineSlotRecipe({
  className: "checkbox",
  slots: checkboxAnatomy.keys(),
  base: {
    root: {
      display: "inline-flex",
      gap: "2",
      alignItems: "center",
      verticalAlign: "top",
      position: "relative",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    control: {
      ...checkboxControlBase,
      borderColor: "transparent",
      borderRadius: "sm",
      focusVisibleRing: "outside",

      _icon: {
        boxSize: "full",
      },
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
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
          borderColor: "border",
          _checked: checkboxControlCheckedState,
          _indeterminate: checkboxControlCheckedState,
          _invalid: {
            background: "fg.error",
          },
        },
      },
      surface: {
        control: {
          bg: "colorPalette.surface.bg",
          borderWidth: "1px",
          borderColor: "colorPalette.surface.border",
          color: "colorPalette.surface.fg",
        },
      },
      subtle: {
        control: {
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
        },
      },
      outline: {
        control: {
          borderWidth: "1px",
          borderColor: "colorPalette.outline.border",
          color: "colorPalette.outline.fg",
          _checked: {
            borderColor: "colorPalette.solid.bg",
          },
        },
      },
      plain: {
        control: {
          color: "colorPalette.plain.fg",
        },
      },
    },
  },
});
