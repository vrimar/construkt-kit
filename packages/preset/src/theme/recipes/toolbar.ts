import { defineSlotRecipe } from "@pandacss/dev";

export const toolbar = defineSlotRecipe({
  className: "toolbar",
  slots: ["root", "separator"],
  base: {
    root: {
      display: "flex",
      alignItems: "center",
      gap: "1.5",
      minW: "min-content",
      // Measuring the width it is given needs the toolbar free to shrink below its content.
      "&[data-collapsible]:not([data-collapsed])": { minW: "0" },
      _vertical: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
    separator: {
      flexShrink: "0",
      alignSelf: "stretch",
      bg: "border",
      _vertical: { w: "1px", my: "1" },
      _horizontal: { h: "1px", mx: "1" },
    },
  },
});
