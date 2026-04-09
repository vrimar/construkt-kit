import { hoverCardAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const hoverCard = defineSlotRecipe({
  className: "hover-card",
  slots: hoverCardAnatomy.keys(),
  base: {
    content: {
      layerStyle: "floating.surface",
      display: "flex",
      flexDirection: "column",
      maxWidth: "80",
      outline: "0",
      padding: "4",
      position: "relative",
      textStyle: "sm",
      transformOrigin: "var(--transform-origin)",
      zIndex: "popover",
      _open: {
        animationStyle: "slide-fade-in",
        animationDuration: "fast",
      },
      _closed: {
        animationStyle: "slide-fade-out",
        animationDuration: "faster",
      },
    },
    arrow: {
      "--arrow-size": "sizes.3",
      "--arrow-background": "colors.neutral.surface.bg",
    },
    arrowTip: {
      borderTopWidth: "0.5px",
      borderInlineStartWidth: "0.5px",
    },
  },
});
