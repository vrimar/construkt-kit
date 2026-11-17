import { tooltipAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, surface } from "./control-size";

export const tooltip = defineSlotRecipe({
  className: "tooltip",
  slots: tooltipAnatomy.keys(),
  base: {
    content: {
      zIndex: "calc(var(--z-index-tooltip) + var(--layer-index, 0))",
      "--tooltip-bg": "colors.bg.inverted",
      bg: "var(--tooltip-bg)",
      color: "fg.inverted",
      borderRadius: "md",
      boxShadow: "sm",
      fontWeight: "semibold",
      px: surface("0.5rem"),
      py: surface("0.375rem"),
      ...controlText("xs"),
      maxWidth: "xs",
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
