import { radioGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { cardAddon, cardBody, cardContent, cardDescription } from "./card-body";
import { controlBox, controlGap, controlPx, controlText } from "./control-size";

export const radioCardGroup = defineSlotRecipe({
  className: "radio-card-group",
  jsx: ["RadioCard", /RadioCard\..+/],
  slots: [
    ...radioGroupAnatomy.keys(),
    "itemIndicator",
    "itemBody",
    "itemContent",
    "itemDescription",
    "itemAddon",
  ],
  base: {
    root: {
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
      textStyle: "label",
      _horizontal: {
        width: "full",
      },
    },
    itemControl: {
      alignItems: "center",
      borderRadius: "full",
      display: "inline-flex",
      flexShrink: "0",
      justifyContent: "center",
      verticalAlign: "top",
      _focusVisible: {
        focusVisibleRing: "outside",
      },
      _invalid: {
        outline: "2px solid",
        outlineColor: "border.error",
        outlineOffset: "2px",
      },
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
      borderWidth: "1px",
      borderColor: "colorPalette.solid.bg",
      borderRadius: "md",
      boxShadow: "0 0 0 1px var(--shadow-color)",
      boxShadowColor: "colorPalette.solid.bg",
      height: "var(--height)",
      pointerEvents: "none",
      pos: "absolute",
      width: "var(--width)",
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
          borderWidth: "1px",
          borderColor: "border.control",
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
          borderWidth: "1px",
          borderColor: "border.control",
          _checked: {
            bg: "colorPalette.solid.bg",
            borderColor: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
          },
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
          borderWidth: "1px",
          borderColor: "border.control",
          _checked: {
            background: "colorPalette.solid.bg",
            borderColor: "colorPalette.solid.bg",
            color: "colorPalette.solid.fg",
          },
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
          borderWidth: "1px",
          borderColor: "border.control",
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
        itemBody: { gap: controlGap("md"), p: controlPx("xl") },
        itemControl: { boxSize: controlBox("lg"), _icon: { boxSize: "3.5" } },
        itemIndicator: { boxSize: "2" },
        itemText: { ...controlText("sm") },
        itemDescription: { ...controlText("sm") },
        itemAddon: { px: controlPx("xl"), py: controlGap("2xl") },
      },
    },
  },
});
