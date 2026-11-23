import { defineSlotRecipe } from "@pandacss/dev";

import {
  type CardSize,
  cardAddon,
  cardBody,
  cardContent,
  cardDescription,
  cardTier,
} from "./card-body";
import { checkboxControl, checkboxControlSize } from "./checkbox-control";
import { solidCheckedFill } from "./choice-control";
import { controlGap } from "./control-size";

const rootCheckedColors = {
  borderColor: "colorPalette.solid.bg",
  bg: "colorPalette.subtle.bg",
};

const rootChecked = {
  ...rootCheckedColors,
  _hover: rootCheckedColors,
};

const subtleChecked = {
  bg: "colorPalette.subtle.bg.active",
  _hover: { bg: "colorPalette.subtle.bg.active" },
};

const tier = (size: CardSize) => {
  const card = cardTier(size);
  return {
    control: card.body,
    checkbox: checkboxControlSize(size),
    label: card.text,
    description: card.text,
    addon: card.addon,
  };
};

export const checkboxCard = defineSlotRecipe({
  className: "checkbox-card",
  slots: ["root", "control", "checkbox", "content", "label", "description", "addon"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      borderWidth: "1px",
      borderColor: "border",
      borderRadius: "md",
      cursor: "pointer",
      userSelect: "none",
      _hover: { bg: "bg.subtle" },
      _checked: rootChecked,
      _indeterminate: rootChecked,
      _disabled: {
        layerStyle: "disabled",
      },
    },
    control: {
      ...cardBody,
      gap: controlGap("2xl"),
    },
    checkbox: {
      ...checkboxControl,
      borderColor: "border.control",
      _checked: solidCheckedFill,
      _indeterminate: solidCheckedFill,
    },
    content: cardContent,
    label: {
      fontWeight: "medium",
    },
    description: cardDescription,
    addon: cardAddon,
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {},
      subtle: {
        root: {
          borderWidth: "0",
          bg: "colorPalette.subtle.bg",
          _hover: { bg: "colorPalette.subtle.bg.hover" },
          _checked: subtleChecked,
          _indeterminate: subtleChecked,
        },
      },
      surface: {
        root: {
          bg: "colorPalette.surface.bg",
          borderColor: "colorPalette.surface.border",
          _hover: {
            borderColor: "colorPalette.surface.border.hover",
          },
          _checked: rootChecked,
          _indeterminate: rootChecked,
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
