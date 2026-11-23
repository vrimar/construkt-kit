import { defineSlotRecipe } from "@pandacss/dev";

import { choiceControlBase } from "./choice-control";
import { controlFont, touchRow } from "./control-size";

export const switchTravel = {
  "--switch-diff": "calc(var(--switch-width) - var(--switch-height))",
  "--switch-x": {
    base: "var(--switch-diff)",
    _rtl: "calc(var(--switch-diff) * -1)",
  },
} as const;

export const switchTrack = {
  display: "inline-flex",
  flexShrink: "0",
  width: "var(--switch-width)",
  height: "var(--switch-height)",
  borderRadius: "full",
  transition: "colors",
} as const;

export const solidSwitchTrack = {
  bg: "neutral.subtle.bg",
  boxShadow: "inset 0 0 0 1px var(--shadow-color)",
  boxShadowColor: "border.control",
} as const;

export const solidSwitchTrackOn = {
  bg: "colorPalette.solid.bg",
  boxShadowColor: "colorPalette.solid.bg",
} as const;

export const switchThumb = {
  width: "var(--switch-height)",
  height: "var(--switch-height)",
  scale: "0.8",
  boxShadow: "xs",
  transitionProperty: "translate",
  transitionDuration: "fast",
} as const;

export const switchThumbOn = { translate: "var(--switch-x) 0" } as const;

export const switchSize = {
  xs: { "--switch-width": "sizes.7", "--switch-height": "sizes.3.5" },
  sm: { "--switch-width": "sizes.8", "--switch-height": "sizes.4" },
  md: { "--switch-width": "sizes.9", "--switch-height": "sizes.4.5" },
  lg: { "--switch-width": "sizes.10", "--switch-height": "sizes.5" },
} as const;

type SwitchSize = keyof typeof switchSize;

const tier = (size: SwitchSize, gap: string, indicatorFont: string) => ({
  root: { gap, ...switchSize[size], "--switch-indicator-font-size": indicatorFont },
  label: { fontSize: controlFont(size) },
});

export const switchRecipe = defineSlotRecipe({
  className: "switch",
  slots: ["root", "label", "control", "thumb", "indicator"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      position: "relative",
      verticalAlign: "middle",
      ...switchTravel,
      cursor: "pointer",
      _disabled: {
        cursor: "not-allowed",
      },
      ...touchRow(),
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
      lineHeight: "1",
    },
    indicator: {
      position: "absolute",
      height: "var(--switch-height)",
      width: "var(--switch-height)",
      fontSize: "var(--switch-indicator-font-size)",
      fontWeight: "medium",
      flexShrink: 0,
      userSelect: "none",
      display: "grid",
      placeContent: "center",
      transition: "inset-inline-start 0.12s ease",
      insetInlineStart: "calc(var(--switch-diff) - 2px)",
      _checked: {
        insetInlineStart: "2px",
      },
    },
    control: {
      ...choiceControlBase,
      ...switchTrack,
      gap: "2",
      justifyContent: "flex-start",
      cursor: "pointer",
      position: "relative",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    thumb: {
      ...switchThumb,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: "inherit",
      _checked: switchThumbOn,
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        control: {
          ...solidSwitchTrack,
          _checked: solidSwitchTrackOn,
        },
        thumb: {
          bg: "white",
          _checked: {
            bg: "colorPalette.solid.fg",
          },
        },
      },
      outline: {
        control: {
          borderWidth: "1px",
          borderColor: "border.control",
          _checked: {
            borderColor: "colorPalette.outline.border",
          },
        },
        thumb: {
          bg: "neutral.subtle.fg",
          _checked: {
            bg: "colorPalette.outline.fg",
          },
        },
      },
      subtle: {
        control: {
          bg: "neutral.subtle.bg",
          _checked: {
            bg: "colorPalette.subtle.bg",
          },
        },
        thumb: {
          bg: "neutral.subtle.fg",
          _checked: {
            bg: "colorPalette.subtle.fg",
          },
        },
      },
    },
    size: {
      xs: tier("xs", "2", "fontSizes.xs"),
      sm: tier("sm", "2", "fontSizes.xs"),
      md: tier("md", "3", "fontSizes.sm"),
      lg: tier("lg", "3", "fontSizes.sm"),
    },
  },
});
