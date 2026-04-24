import { tooltipAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const tooltip = defineSlotRecipe({
  className: "tooltip",
  slots: tooltipAnatomy.keys(),
  base: {
    positioner: {
      zIndex: "tooltip",
    },
    content: {
      "--tooltip-bg": "colors.neutral.solid.bg",
      bg: "var(--tooltip-bg)",
      color: "colorPalette.solid.fg",
      borderRadius: "md",
      boxShadow: "sm",
      fontWeight: "semibold",
      px: "2",
      py: "1.5",
      textStyle: "xs",
      maxWidth: "xs",
      _open: {
        animationStyle: "scale-fade-in",
        animationDuration: "fast",
      },
      _closed: {
        animationStyle: "scale-fade-out",
        animationDuration: "faster",
      },
    },
    arrow: {
      "--arrow-size": "sizes.2",
      "--arrow-background": "var(--tooltip-bg)",
    },
    arrowTip: {
      borderTopWidth: "1px",
      borderInlineStartWidth: "1px",
      borderColor: "var(--tooltip-bg)",
    },
  },
});
