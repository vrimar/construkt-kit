import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlBox, controlGap, controlPx, controlText } from "./control-size";

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
      _checked: {
        borderColor: "colorPalette.solid.bg",
        bg: "colorPalette.subtle.bg",
      },
    },
    control: {
      display: "flex",
      alignItems: "center",
      gap: controlGap("2xl"),
      flex: "1",
    },
    checkbox: {
      ...checkboxControlBase,
      borderColor: "border",
      borderRadius: "sm",
      focusVisibleRing: "outside",
      _checked: checkboxControlCheckedState,
      _indeterminate: checkboxControlCheckedState,
      _invalid: {
        background: "fg.error",
      },
      _icon: {
        boxSize: "full",
      },
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
      flex: "1",
    },
    label: {
      fontWeight: "medium",
    },
    description: {
      color: "fg.muted",
    },
    addon: {
      borderTopWidth: "1px",
      borderColor: "border",
    },
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
