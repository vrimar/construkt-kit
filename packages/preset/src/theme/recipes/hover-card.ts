import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, surface } from "./control-size";
import { floatingArrow, floatingPositioner } from "./floating";

export const hoverCard = defineSlotRecipe({
  className: "hover-card",
  slots: ["arrow", "arrowTip", "trigger", "positioner", "content"],
  base: {
    positioner: floatingPositioner,
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
    },
    arrow: floatingArrow.arrow,
    arrowTip: floatingArrow.arrowTip,
  },
});
