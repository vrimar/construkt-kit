import { tabsAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

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
      width: "full",
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
        trigger: { h: "8", minW: "8", textStyle: "xs", px: "3", gap: "2" },
      },
      sm: {
        list: { gap: "1" },
        trigger: { h: "9", minW: "9", textStyle: "sm", px: "3.5", gap: "2" },
      },
      md: {
        list: { gap: "1" },
        trigger: { h: "10", minW: "10", textStyle: "sm", px: "4", gap: "2" },
      },
      lg: {
        list: { gap: "1" },
        trigger: { h: "11", minW: "11", textStyle: "md", px: "4.5", gap: "2" },
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
          textAlign: "center",
          justifyContent: "center",
        },
      },
    },
  },
});
