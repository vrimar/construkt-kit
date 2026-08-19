import { hoverCardAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, surface } from "./control-size";
import { floatingArrow } from "./floating-arrow";

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
      padding: surface("1rem"),
      position: "relative",
      ...controlText("sm"),
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
    arrow: floatingArrow.arrow,
    arrowTip: floatingArrow.arrowTip,
  },
});
