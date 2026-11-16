import { defineSlotRecipe } from "@pandacss/dev";

import { cardAddon, cardBody, cardContent, cardDescription } from "./card-body";
import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlBox, controlGap, controlPx, controlText } from "./control-size";

const rootCheckedColors = {
  borderColor: "colorPalette.solid.bg",
  bg: "colorPalette.subtle.bg",
};

const rootChecked = {
  ...rootCheckedColors,
  _hover: rootCheckedColors,
};

export const checkboxCard = defineSlotRecipe({
  className: "checkbox-card",
  slots: ["root", "control", "checkbox", "content", "label", "description", "addon"],
  jsx: ["CheckboxCard"],
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
      _disabled: {
        layerStyle: "disabled",
      },
    },
    control: {
      ...cardBody,
      gap: controlGap("2xl"),
    },
    checkbox: {
      ...checkboxControlBase,
      cursor: "inherit",
      borderColor: "border",
      borderRadius: "sm",
      _checked: checkboxControlCheckedState,
      _indeterminate: checkboxControlCheckedState,
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
          _checked: {
            bg: "colorPalette.subtle.bg.active",
            _hover: { bg: "colorPalette.subtle.bg.active" },
          },
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
        },
      },
    },
    size: {
      sm: {
        control: { p: controlPx("md") },
        checkbox: { boxSize: controlBox("sm"), _icon: { boxSize: "2.5" } },
        label: { ...controlText("xs") },
        description: { ...controlText("xs") },
        addon: { px: controlPx("md"), py: controlGap("md") },
      },
      md: {
        control: { p: controlPx("xl") },
        checkbox: { boxSize: controlBox("md"), _icon: { boxSize: "3" } },
        label: { ...controlText("sm") },
        description: { ...controlText("sm") },
        addon: { px: controlPx("xl"), py: controlGap("2xl") },
      },
      lg: {
        control: { p: controlPx("2xl") },
        checkbox: { boxSize: controlBox("lg"), _icon: { boxSize: "3.5" } },
        label: { ...controlText("lg") },
        description: { ...controlText("lg") },
        addon: { px: controlPx("2xl"), py: "4" },
      },
    },
  },
});
