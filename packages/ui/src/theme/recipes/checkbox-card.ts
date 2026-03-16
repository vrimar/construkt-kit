import { defineSlotRecipe } from "@pandacss/dev";

export const checkboxCard = defineSlotRecipe({
  className: "checkbox-card",
  slots: ["root", "control", "content", "label", "description", "addon"],
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
      gap: "3",
      flex: "1",
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
        control: { p: "3" },
        label: { textStyle: "xs" },
        description: { textStyle: "xs" },
        addon: { px: "3", py: "2" },
      },
      md: {
        control: { p: "4" },
        label: { textStyle: "sm" },
        description: { textStyle: "sm" },
        addon: { px: "4", py: "3" },
      },
      lg: {
        control: { p: "5" },
        label: { textStyle: "md" },
        description: { textStyle: "md" },
        addon: { px: "5", py: "4" },
      },
    },
  },
});
