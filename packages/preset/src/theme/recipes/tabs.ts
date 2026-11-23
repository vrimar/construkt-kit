import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlGap, controlH, controlPx, controlText } from "./control-size";
import { slidingIndicator } from "./indicator";

const tier = (height: ControlSize, text: ControlSize, inset: ControlSize) => ({
  trigger: {
    h: controlH(height),
    "--tabs-trigger-min-w": controlH(height),
    ...controlText(text),
    px: controlPx(inset),
  },
});

export const tabs = defineSlotRecipe({
  className: "tabs",
  slots: ["root", "list", "trigger", "content", "indicator"],
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
      gap: "1",
      position: "relative",
      isolation: "isolate",
      _horizontal: {
        flexDirection: "row",
        overflowX: "auto",
        scrollbar: "hidden",
        scrollSnapType: "x proximity",
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
      fontWeight: "medium",
      gap: controlGap("md"),
      outline: "0",
      position: "relative",
      focusVisibleRing: "inside",
      _focusVisible: {
        zIndex: 1,
      },
      _disabled: {
        layerStyle: "disabled",
      },
      // Natural width so horizontal tabs scroll instead of squishing; `fitted`/`_vertical` override.
      flexShrink: 0,
      minW: "var(--tabs-trigger-fitted-min-w, var(--tabs-trigger-min-w))",
      "--tabs-trigger-fitted-min-w": "initial",
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
      ...slidingIndicator,
      zIndex: -1,
    },
  },
  defaultVariants: {
    size: "md",
    variant: "line",
  },
  variants: {
    size: {
      xs: tier("sm", "xs", "md"),
      sm: tier("md", "sm", "lg"),
      md: tier("lg", "sm", "xl"),
      lg: tier("xl", "lg", "2xl"),
    },
    variant: {
      line: {
        root: {
          alignItems: "stretch",
        },
        list: {
          _horizontal: {
            boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
            boxShadowColor: "border",
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
          },
          _vertical: {
            insetInlineStart: "-1px",
            width: "0.5",
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
            color: "colorPalette.fg",
          },
          _selected: {
            color: "colorPalette.surface.fg",
            bg: "bg",
            borderColor: "border",
            borderRadius: "md",
            _hover: {
              color: "colorPalette.surface.fg",
            },
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
          "--tabs-trigger-fitted-min-w": "0",
          textAlign: "center",
          justifyContent: "center",
        },
      },
    },
  },
});
