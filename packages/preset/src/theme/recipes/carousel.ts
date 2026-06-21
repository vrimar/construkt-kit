import { carouselAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlIcon } from "./control-size";

export const carousel = defineSlotRecipe({
  className: "carousel",
  slots: carouselAnatomy.keys(),
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
    prevTrigger: {
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
    },
    nextTrigger: {
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
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
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
        prevTrigger: {
          h: controlH("lg"),
          w: controlH("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        nextTrigger: {
          h: controlH("lg"),
          w: controlH("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
      },
    },
  },
});
