import { defineSlotRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlInputText,
  controlPx,
  controlText,
  inputFont,
} from "./control-size";

const tier = (size: ControlSize, py: string) => ({
  preview: { ...controlText(size), px: controlPx(size), py },
  input: { ...controlInputText(size), px: controlPx(size), py },
});

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
      "2xs": tier("2xs", "0.5"),
      xs: tier("xs", "1.5"),
      sm: tier("sm", "2"),
      md: tier("md", "2.5"),
      lg: tier("lg", "2.5"),
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
