import { defineSlotRecipe } from "@pandacss/dev";

import { controlInputText, controlPx, controlText, inputFont } from "./control-size";

export const editable = defineSlotRecipe({
  className: "editable",
  slots: [
    "root",
    "area",
    "label",
    "preview",
    "input",
    "editTrigger",
    "submitTrigger",
    "cancelTrigger",
    "control",
  ],
  base: {
    root: {
      alignItems: "center",
      display: "inline-flex",
      gap: "1.5",
      position: "relative",
      width: "full",
    },
    preview: {
      alignItems: "center",
      borderRadius: "md",
      cursor: "default",
      display: "inline-flex",
      transitionDuration: "normal",
      transitionProperty: "common",
      _disabled: {
        userSelect: "none",
      },
      _hover: {
        bg: "colorPalette.plain.bg.hover",
      },
      _placeholderShown: {
        color: "fg.subtle",
      },
    },
    input: {
      borderRadius: "md",

      focusRingWidth: "2px",
      focusVisibleRing: "inside",
      transitionDuration: "normal",
      transitionProperty: "common",
      width: "full",
      _focusVisible: {
        outlineOffset: "-1px",
      },
    },
    control: {
      alignItems: "center",
      display: "inline-flex",
      gap: "1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    autoResize: {
      true: {
        area: { display: "inline-grid" },
        input: { gridArea: "1 / 1 / auto / auto", _hidden: { visibility: "hidden" } },
        preview: {
          whiteSpace: "pre",
          gridArea: "1 / 1 / auto / auto",
          overflow: "hidden",
          textOverflow: "ellipsis",
          _hidden: { visibility: "hidden" },
        },
      },
    },
    size: {
      "2xs": {
        preview: { ...controlText("2xs"), px: controlPx("2xs"), py: "0.5" },
        input: { ...controlInputText("2xs"), px: controlPx("2xs"), py: "0.5" },
      },
      xs: {
        preview: { ...controlText("xs"), px: controlPx("xs"), py: "1.5" },
        input: { ...controlInputText("xs"), px: controlPx("xs"), py: "1.5" },
      },
      sm: {
        preview: { ...controlText("sm"), px: controlPx("sm"), py: "2" },
        input: { ...controlInputText("sm"), px: controlPx("sm"), py: "2" },
      },
      md: {
        preview: { ...controlText("md"), px: controlPx("md"), py: "2.5" },
        input: { ...controlInputText("md"), px: controlPx("md"), py: "2.5" },
      },
      lg: {
        preview: { ...controlText("lg"), px: controlPx("lg"), py: "2.5" },
        input: { ...controlInputText("lg"), px: controlPx("lg"), py: "2.5" },
      },
      inherit: {
        preview: {
          font: "inherit",
          px: "1.5",
          py: "0.5",
          mx: "-1.5",
        },
        input: {
          font: "inherit",
          fontSize: inputFont("1em"),
          letterSpacing: "inherit",
          px: "1.5",
          py: "0.5",
          mx: "-1.5",
          width: "calc(100% + {spacing.3})",
        },
      },
    },
  },
});
