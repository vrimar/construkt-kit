import { defineSlotRecipe } from "@pandacss/dev";

import {
  type CardSize,
  cardAddon,
  cardBody,
  cardContent,
  cardDescription,
  cardTier,
} from "./card-body";
import { choiceControlBase, solidCheckedFill } from "./choice-control";
import { controlBox, controlGap } from "./control-size";
import { fieldLabel } from "./field";
import { slidingIndicator } from "./indicator";

const tier = (size: CardSize) => {
  const card = cardTier(size);
  return {
    itemBody: { gap: controlGap(size), ...card.body },
    itemText: card.text,
    itemDescription: card.text,
    itemAddon: card.addon,
  };
};

export const radioCardGroup = defineSlotRecipe({
  className: "radio-card-group",
  slots: [
    "root",
    "label",
    "item",
    "itemText",
    "itemControl",
    "indicator",
    "itemIndicator",
    "itemBody",
    "itemContent",
    "itemDescription",
    "itemAddon",
  ],
  base: {
    root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
      _horizontal: {
        flexDirection: "row",
        flexWrap: "wrap",
      },
    },
    item: {
      borderRadius: "md",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      userSelect: "none",
      width: "full",
      _horizontal: {
        flex: "1",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    itemBody: cardBody,
    label: {
      ...fieldLabel,
      _horizontal: {
        width: "full",
      },
    },
    itemControl: {
      ...choiceControlBase,
      alignItems: "center",
      borderRadius: "full",
      justifyContent: "center",
      verticalAlign: "top",
      borderWidth: "1px",
      borderColor: "border.control",
    },
    itemIndicator: {
      bg: "currentColor",
      borderRadius: "full",
    },
    itemText: {
      textStyle: "label",
    },
    itemContent: cardContent,
    itemDescription: cardDescription,
    itemAddon: cardAddon,
    indicator: {
      ...slidingIndicator,
      borderWidth: "1px",
      borderColor: "colorPalette.solid.bg",
      borderRadius: "md",
      boxShadow: "0 0 0 1px var(--shadow-color)",
      boxShadowColor: "colorPalette.solid.bg",
      pointerEvents: "none",
      top: "var(--indicator-top)",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
  variants: {
    variant: {
      subtle: {
        item: {
          background: "neutral.subtle.bg",
          color: "neutral.subtle.fg",
          _checked: {
            background: "colorPalette.subtle.bg",
            color: "colorPalette.subtle.fg",
          },
        },
        itemControl: {
          _checked: {
            borderColor: "colorPalette.solid.bg",
            color: "colorPalette.solid.bg",
          },
        },
      },
      outline: {
        item: {
          borderWidth: "1px",
          borderColor: "neutral.outline.border",
          _checked: {
            boxShadow: "0 0 0 1px var(--shadow-color)",
            boxShadowColor: "colorPalette.solid.bg",
            borderColor: "colorPalette.solid.bg",
          },
        },
        itemControl: {
          _checked: solidCheckedFill,
        },
      },
      surface: {
        item: {
          borderWidth: "1px",
          background: "neutral.surface.bg",
          borderColor: "neutral.surface.border",
          color: "neutral.surface.fg",
          _checked: {
            boxShadow: "0 0 0 1px var(--shadow-color)",
            boxShadowColor: "colorPalette.solid.bg",
            borderColor: "colorPalette.solid.bg",
          },
        },
        itemControl: {
          _checked: solidCheckedFill,
        },
      },
      solid: {
        item: {
          borderWidth: "1px",
          _checked: {
            bg: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
            borderColor: "colorPalette.solid.bg",
          },
        },
        itemControl: {
          _checked: {
            background: "colorPalette.solid.fg",
            borderColor: "colorPalette.solid.fg",
            color: "colorPalette.solid.bg",
          },
        },
      },
    },
    size: {
      md: {
        ...tier("md"),
        itemControl: { boxSize: controlBox("lg"), _icon: { boxSize: "3.5" } },
        itemIndicator: { boxSize: "2" },
      },
    },
  },
});
