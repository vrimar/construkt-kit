import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, surface } from "./control-size";
import { floatingArrow, floatingPositioner } from "./floating";

export const tooltip = defineSlotRecipe({
  className: "tooltip",
  slots: ["trigger", "arrow", "arrowTip", "positioner", "content"],
  base: {
    positioner: { ...floatingPositioner, pointerEvents: "none" },
    content: {
      "--tooltip-bg": "colors.bg.inverted",
      bg: "var(--tooltip-bg)",
      color: "fg.inverted",
      borderRadius: "md",
      boxShadow: "sm",
      fontWeight: "medium",
      px: surface("0.5rem"),
      py: surface("0.375rem"),
      ...controlText("xs"),
      maxWidth: "xs",
    },
    arrow: {
      ...floatingArrow.arrow,
      "--arrow-size": "sizes.2",
      "--arrow-background": "var(--tooltip-bg)",
    },
    arrowTip: {
      ...floatingArrow.arrowTip,
      borderTopWidth: "1px",
      borderLeftWidth: "1px",
      borderColor: "var(--tooltip-bg)",
    },
  },
});
