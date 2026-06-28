import { tabsAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlH, controlPx, controlText } from "./control-size";

export const tabs = defineSlotRecipe({
  className: "tabs",
  slots: tabsAnatomy.keys(),
  base: {
    root: {
      position: "relative",
      display: "flex",
      alignItems: "start",
      _horizontal: {
        flexDirection: "column",
        gap: "2",
      },
      _vertical: {
        flexDirection: "row",
        gap: "4",
      },
    },
    list: {
      display: "flex",
      position: "relative",
      isolation: "isolate",
      _horizontal: {
        flexDirection: "row",
        overflowX: "auto",
        scrollbarWidth: "none",
        scrollSnapType: "x proximity",
        "&::-webkit-scrollbar": { display: "none" },
      },
      _vertical: {
        flexDirection: "column",
      },
    },
    trigger: {
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      display: "flex",
      fontWeight: "semibold",
      outline: "0",
      position: "relative",
      _focusVisible: {
        zIndex: 1,
        focusVisibleRing: "outside",
      },
      _disabled: {
        layerStyle: "disabled",
      },
      // Natural width so horizontal tabs scroll instead of squishing; `fitted`/`_vertical` override.
      flexShrink: 0,
      scrollSnapAlign: "start",
      _vertical: {
        width: "full",
      },
    },
    content: {
      focusVisibleRing: "inside",

      _horizontal: {
        width: "100%",
      },
      _vertical: {
        height: "100%",
      },
    },
    indicator: {
      width: "var(--width)",
      height: "var(--height)",
      zIndex: -1,
    },
  },
  defaultVariants: {
    size: "md",
    variant: "line",
  },
  variants: {
    size: {
      xs: {
        list: { gap: "1" },
        trigger: {
          h: controlH("sm"),
          minW: controlH("sm"),
          ...controlText("xs"),
          px: controlPx("md"),
          gap: controlGap("md"),
        },
      },
      sm: {
        list: { gap: "1" },
        trigger: {
          h: controlH("md"),
          minW: controlH("md"),
          ...controlText("sm"),
          px: controlPx("lg"),
          gap: controlGap("md"),
        },
      },
      md: {
        list: { gap: "1" },
        trigger: {
          h: controlH("lg"),
          minW: controlH("lg"),
          ...controlText("sm"),
          px: controlPx("xl"),
          gap: controlGap("md"),
        },
      },
      lg: {
        list: { gap: "1" },
        trigger: {
          h: controlH("xl"),
          minW: controlH("xl"),
          ...controlText("lg"),
          px: controlPx("2xl"),
          gap: controlGap("md"),
        },
      },
    },
    variant: {
      line: {
        root: {
          alignItems: "stretch",
        },
        list: {
          _horizontal: {
            borderBottomWidth: "1px",
          },
          _vertical: {
            borderStartWidth: "1px",
          },
        },
        indicator: {
          background: "colorPalette.solid.bg",
          _horizontal: {
            bottom: "0",
            height: "0.5",
            transform: "translateY(1px)",
          },
          _vertical: {
            left: "0",
            width: "0.5",
            transform: "translateX(-1px)",
          },
        },
        trigger: {
          color: "fg.muted",
          _selected: {
            color: "colorPalette.plain.fg",
          },
        },
      },
      subtle: {
        trigger: {
          color: "fg.muted",
          _selected: {
            color: "colorPalette.subtle.fg",
          },
        },
        indicator: {
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
          borderRadius: "md",
        },
      },
      enclosed: {
        list: {
          bg: "neutral.subtle.bg",
          boxShadow: "inset 0 0 0px 1px var(--shadow-color)",
          boxShadowColor: "border",
          borderRadius: "md",
          p: "1",
        },
        trigger: {
          color: "fg.muted",
          border: "1px solid transparent",
          _hover: {
            color: "colorPalette.solid.bg",
          },
          _selected: {
            color: "colorPalette.surface.fg",
            bg: "bg",
            borderColor: "border",
            borderRadius: "md",
          },
        },
        indicator: {
          borderRadius: "md",
          boxShadow: {
            _light: "xs",
            _dark: "none",
          },
          bg: "bg.control",
        },
      },
    },
    fitted: {
      true: {
        root: {
          alignItems: "stretch",
        },
        trigger: {
          flex: 1,
          flexShrink: 1,
          minWidth: 0,
          textAlign: "center",
          justifyContent: "center",
        },
      },
    },
  },
});
