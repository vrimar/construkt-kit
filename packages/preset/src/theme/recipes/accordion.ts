import { defineSlotRecipe } from "@pandacss/dev";

import { collapsiblePanel } from "./collapsible";
import { type ControlSize, controlGap, controlText } from "./control-size";

const tier = (size: ControlSize, text: ControlSize) => ({
  root: { "--accordion-padding-y": controlGap(size) },
  itemTrigger: {
    ...controlText(text),
    py: "var(--accordion-padding-y)",
  },
});

export const accordion = defineSlotRecipe({
  className: "accordion",
  slots: ["root", "item", "itemTrigger", "itemContent", "itemIndicator", "itemBody"],
  base: {
    root: {
      width: "full",
      "--accordion-radius": "radii.md",
    },
    item: {
      overflowAnchor: "none",
    },
    itemTrigger: {
      alignItems: "center",
      borderRadius: "var(--accordion-radius)",
      color: "fg",
      cursor: "pointer",
      display: "flex",
      fontWeight: "medium",
      gap: "3",
      justifyContent: "space-between",
      textAlign: "start",
      ...controlText("lg"),
      width: "full",
      focusVisibleRing: "outside",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    itemIndicator: {
      transition: "rotate 0.2s",
      transformOrigin: "center",
      color: "fg.subtle",
      _open: {
        rotate: "180deg",
      },
      _icon: {
        width: "1.2em",
        height: "1.2em",
      },
    },
    itemBody: {
      pb: "calc(var(--accordion-padding-y) * 2)",
      color: "fg.muted",
    },
    itemContent: {
      ...collapsiblePanel,
      borderRadius: "var(--accordion-radius)",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        item: {
          borderBottomWidth: "1px",
        },
      },
      plain: {},
    },
    size: {
      sm: tier("md", "sm"),
      md: tier("xl", "lg"),
      lg: tier("2xl", "2xl"),
    },
  },
});
