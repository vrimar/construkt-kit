import { radioGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlGap, controlBox, controlText } from "./control-size";

const tier = (size: ControlSize) => ({
  item: { gap: controlGap(size) },
  itemControl: { boxSize: controlBox(size) },
  itemText: controlText(size),
});

export const radioGroup = defineSlotRecipe({
  className: "radio-group",
  slots: radioGroupAnatomy.keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "3",
    },
    itemControl: {
      alignItems: "center",
      borderRadius: "full",
      display: "inline-flex",
      flexShrink: 0,
      justifyContent: "center",
      verticalAlign: "top",
      _after: {
        content: '""',
        display: "block",
        borderRadius: "full",
        boxSize: "40%",
      },
      _focusVisible: {
        focusVisibleRing: "outside",
      },
    },
    item: {
      alignItems: "center",
      cursor: "pointer",
      display: "flex",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    itemText: {
      fontWeight: "medium",
      userSelect: "none",
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        itemControl: {
          boxShadow: "inset 0 0 0 1px var(--shadow-color)",
          boxShadowColor: "neutral.surface.border",
          _checked: {
            bg: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
            boxShadowColor: "colorPalette.solid.bg",
            _after: {
              background: "colorPalette.solid.fg",
            },
          },
        },
      },
      outline: {
        itemControl: {
          boxShadow: "inset 0 0 0 1px var(--shadow-color)",
          boxShadowColor: "colorPalette.outline.border",
          _checked: {
            boxShadowColor: "colorPalette.outline.border",
            color: "colorPalette.outline.fg",
            _after: {
              background: "colorPalette.outline.fg",
            },
          },
        },
      },
      subtle: {
        itemControl: {
          bg: "colorPalette.subtle.bg",
          _checked: {
            color: "colorPalette.subtle.fg",
            _after: {
              background: "colorPalette.subtle.fg",
            },
          },
        },
      },
    },
    size: {
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
    },
  },
});
