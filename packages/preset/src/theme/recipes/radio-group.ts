import { defineSlotRecipe } from "@pandacss/dev";

import { choiceControlBase } from "./choice-control";
import { type ControlSize, controlGap, controlBox, controlText, touchRow } from "./control-size";

const tier = (size: ControlSize) => ({
  item: { gap: controlGap(size) },
  itemControl: { boxSize: controlBox(size) },
  itemText: controlText(size),
});

export const radioGroup = defineSlotRecipe({
  className: "radio-group",
  slots: ["root", "item", "itemText", "itemControl"],
  base: {
    root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "3",
      _horizontal: {
        flexDirection: "row",
        flexWrap: "wrap",
      },
    },
    itemControl: {
      ...choiceControlBase,
      alignItems: "center",
      borderRadius: "full",
      justifyContent: "center",
      verticalAlign: "top",
      boxShadow: "inset 0 0 0 1px var(--shadow-color)",
      _after: {
        content: '""',
        display: "block",
        borderRadius: "full",
        boxSize: "40%",
      },
    },
    item: {
      alignItems: "center",
      cursor: "pointer",
      display: "flex",
      _disabled: {
        layerStyle: "disabled",
      },
      ...touchRow(),
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
          boxShadowColor: "border.control",
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
          boxShadowColor: "colorPalette.control",
          _checked: {
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
          boxShadowColor: "colorPalette.control",
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
