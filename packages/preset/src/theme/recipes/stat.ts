import { defineSlotRecipe } from "@pandacss/dev";

export const stat = defineSlotRecipe({
  className: "stat",
  slots: ["root", "label", "valueText", "helpText", "valueUnit", "trendIndicator"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
    },
    label: {
      textStyle: "sm",
      color: "fg.muted",
      display: "inline-flex",
      alignItems: "center",
      gap: "1",
    },
    valueText: {
      fontWeight: "semibold",
      verticalAlign: "baseline",
      lineHeight: "tight",
    },
    helpText: {
      textStyle: "xs",
      color: "fg.muted",
    },
    valueUnit: {
      fontWeight: "normal",
      color: "fg.muted",
    },
    trendIndicator: {
      fontSize: "xs",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: {
        valueText: { textStyle: "xl" },
        valueUnit: { textStyle: "xs" },
      },
      md: {
        valueText: { textStyle: "2xl" },
        valueUnit: { textStyle: "sm" },
      },
      lg: {
        valueText: { textStyle: "3xl" },
        valueUnit: { textStyle: "md" },
      },
    },
  },
});
