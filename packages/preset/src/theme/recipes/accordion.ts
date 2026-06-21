import { accordionAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlPx, controlText } from "./control-size";

export const accordion = defineSlotRecipe({
  className: "accordion",
  slots: accordionAnatomy.extendWith("itemBody").keys(),
  base: {
    root: {
      width: "full",
      "--accordion-radius": "radii.l2",
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
      fontWeight: "semibold",
      gap: "3",
      justifyContent: "space-between",
      textAlign: "start",
      ...controlText("2xl"),
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
      overflow: "hidden",
      borderRadius: "var(--accordion-radius)",
      _open: {
        animationName: "expand-height, fade-in",
        animationDuration: "normal",
      },
      _closed: {
        animationName: "collapse-height, fade-out",
        animationDuration: "normal",
      },
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
      sm: {
        root: {
          "--accordion-padding-x": controlPx("md"),
          "--accordion-padding-y": controlGap("md"),
        },
        itemTrigger: {
          ...controlText("sm"),
          py: "var(--accordion-padding-y)",
        },
      },
      md: {
        root: {
          "--accordion-padding-x": controlPx("xl"),
          "--accordion-padding-y": controlGap("xl"),
        },
        itemTrigger: {
          ...controlText("lg"),
          py: "var(--accordion-padding-y)",
        },
      },
      lg: {
        root: {
          "--accordion-padding-x": controlPx("2xl"),
          "--accordion-padding-y": controlGap("2xl"),
        },
        itemTrigger: {
          ...controlText("2xl"),
          py: "var(--accordion-padding-y)",
        },
      },
    },
  },
});
