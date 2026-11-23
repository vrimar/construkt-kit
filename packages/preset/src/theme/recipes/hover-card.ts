import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";
import { floatingArrow, floatingContent, floatingPositioner } from "./floating";

export const hoverCard = defineSlotRecipe({
  className: "hover-card",
  slots: ["arrow", "arrowTip", "trigger", "positioner", "content"],
  base: {
    positioner: floatingPositioner,
    content: {
      ...floatingContent,
      maxWidth: "80",
      padding: surface("1rem"),
    },
    arrow: floatingArrow.arrow,
    arrowTip: floatingArrow.arrowTip,
  },
});
