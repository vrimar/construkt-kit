import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { controlH, controlIcon } from "./control-size";

export const carouselGlobalVars: GlobalVarsDefinition = {
  "--carousel-slides-per-page": { syntax: "*", inherits: false },
  "--carousel-spacing": { syntax: "*", inherits: false },
  "--carousel-peek": { syntax: "*", inherits: false },
  "--carousel-snap-align": { syntax: "*", inherits: false },
};

const itemSize =
  "calc(100% / var(--carousel-slides-per-page) - var(--carousel-spacing) * (var(--carousel-slides-per-page) - 1) / var(--carousel-slides-per-page))";

const trigger = {
  alignItems: "center",
  appearance: "none",
  borderRadius: "md",
  color: "fg.muted",
  cursor: "pointer",
  display: "inline-flex",
  flexShrink: "0",
  focusVisibleRing: "outside",
  justifyContent: "center",
  outline: "0",
  transition: "colors",
  userSelect: "none",
  _hover: {
    bg: "neutral.plain.bg.hover",
    color: "fg",
  },
  _disabled: {
    layerStyle: "disabled",
  },
  _icon: {
    flexShrink: "0",
  },
} as const;

const triggerSize = {
  h: controlH("lg"),
  w: controlH("lg"),
  _icon: { boxSize: controlIcon("lg") },
};

export const carousel = defineSlotRecipe({
  className: "carousel",
  slots: [
    "root",
    "itemGroup",
    "item",
    "control",
    "nextTrigger",
    "prevTrigger",
    "indicatorGroup",
    "indicator",
    "autoplayTrigger",
  ],
  base: {
    root: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "2",
      _vertical: {
        flexDirection: "row",
      },
    },
    control: {
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "md",
      display: "flex",
      _vertical: {
        flexDirection: "column",
      },
    },
    itemGroup: {
      flex: "1",
      display: "grid",
      gap: "var(--carousel-spacing)",
      scrollbarWidth: "none",
      overscrollBehaviorX: "contain",
      "--carousel-snap-strictness": "mandatory",
      _horizontal: {
        gridAutoFlow: "column",
        gridAutoColumns: itemSize,
        overflowX: "auto",
        paddingInline: "var(--carousel-peek)",
        scrollPaddingInline: "var(--carousel-peek)",
        scrollSnapType: "x var(--carousel-snap-strictness)",
        _dragging: { scrollSnapType: "none" },
      },
      _vertical: {
        gridAutoFlow: "row",
        gridAutoRows: itemSize,
        overflowY: "auto",
        paddingBlock: "var(--carousel-peek)",
        scrollPaddingBlock: "var(--carousel-peek)",
        scrollSnapType: "y var(--carousel-snap-strictness)",
        _dragging: { scrollSnapType: "none" },
      },
    },
    item: {
      flex: "0 0 auto",
      scrollSnapAlign: "var(--carousel-snap-align)",
      _horizontal: { maxWidth: "100%" },
      _vertical: { maxHeight: "100%" },
    },
    indicatorGroup: {
      display: "flex",
      _vertical: {
        flexDirection: "column",
      },
    },
    indicator: {
      borderRadius: "full",
      background: "neutral.subtle.bg",
      cursor: "pointer",
      _current: {
        background: "colorPalette.solid.bg",
      },
      focusVisibleRing: "outside",
    },
    prevTrigger: trigger,
    nextTrigger: trigger,
    autoplayTrigger: trigger,
  },
  defaultVariants: {
    size: "md",
    snapType: "mandatory",
    autoSize: false,
  },
  variants: {
    snapType: {
      mandatory: {},
      proximity: {
        itemGroup: { "--carousel-snap-strictness": "proximity" },
      },
    },
    autoSize: {
      true: {
        itemGroup: { display: "flex", _vertical: { flexDirection: "column" } },
      },
      false: {},
    },
    inline: {
      true: {
        control: {
          background: { _light: "white.a11", _dark: "black.a11" },
          bottom: "3",
          left: "50%",
          p: "1",
          position: "absolute",
          transform: "translateX(-50%)",
        },
      },
    },
    size: {
      md: {
        control: {
          gap: "3",
        },
        indicatorGroup: {
          gap: "3",
        },
        indicator: {
          boxSize: "2.5",
        },
        prevTrigger: triggerSize,
        nextTrigger: triggerSize,
        autoplayTrigger: triggerSize,
      },
    },
  },
});
