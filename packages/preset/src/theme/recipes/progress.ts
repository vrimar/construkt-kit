import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { visual } from "./control-size";

/** The value as a percentage of the range, set on the root, and the circle geometry derived from it. */
export const progressGlobalVars: GlobalVarsDefinition = {
  "--progress-percent": { syntax: "*", inherits: true },
  "--progress-radius": { syntax: "*", inherits: false },
  "--progress-circumference": { syntax: "*", inherits: false },
};

const circleGeometry = {
  "--progress-radius": "calc(var(--size) / 2 - var(--thickness) / 2)",
  cx: "calc(var(--size) / 2)",
  cy: "calc(var(--size) / 2)",
  r: "var(--progress-radius)",
  strokeWidth: "var(--thickness)",
} as const;

export const progress = defineSlotRecipe({
  className: "progress",
  slots: [
    "root",
    "label",
    "track",
    "range",
    "valueText",
    "view",
    "circle",
    "circleTrack",
    "circleRange",
    "segments",
    "segment",
  ],
  base: {
    root: {
      textStyle: "sm",
      position: "relative",
    },
    circle: {
      display: "block",
      flexShrink: 0,
      width: "var(--size)",
      height: "var(--size)",
      color: "colorPalette.solid.bg",
    },
    circleTrack: {
      ...circleGeometry,
      fill: "transparent",
    },
    circleRange: {
      ...circleGeometry,
      "--progress-circumference": "calc(2 * 3.14159 * var(--progress-radius))",
      strokeDasharray: "var(--progress-circumference)",
      strokeDashoffset:
        "calc(var(--progress-circumference) * ((100 - var(--progress-percent)) / 100))",
      transformOrigin: "center",
      transform: "rotate(-90deg)",
      fill: "transparent",
      stroke: "currentColor",
      transitionProperty: "stroke-dashoffset",
      transitionDuration: "slow",
      _indeterminate: {
        strokeDasharray: "none",
      },
    },
    track: {
      overflow: "hidden",
      position: "relative",
    },
    range: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transitionProperty: "width, height",
      transitionDuration: "slow",
      height: "100%",
      color: "colorPalette.solid.fg",
      "--track-color": "colors.colorPalette.solid.bg",
      bgColor: "var(--track-color)",
      "&:not([data-indeterminate])": {
        _horizontal: { width: "calc(var(--progress-percent) * 1%)" },
        _vertical: { height: "calc(var(--progress-percent) * 1%)" },
      },
      _indeterminate: {
        "--animate-from-x": "-40%",
        "--animate-to-x": "100%",
        position: "absolute",
        willChange: "left",
        minWidth: "50%",
        animation: "position 1s ease infinite normal none running",
        bgColor: "transparent",
        backgroundImage: `linear-gradient(to right, transparent 0%, var(--track-color) 50%, transparent 100%)`,
      },
    },
    segments: {
      display: "flex",
      gap: "1",
    },
    segment: {
      flex: "1",
      minWidth: "0",
      bgColor: "var(--progress-segment-bg)",
      transitionProperty: "background-color, border-color",
      transitionDuration: "slow",
      _filled: {
        bgColor: "colorPalette.solid.bg",
      },
    },
    label: {
      display: "inline-flex",
      fontWeight: "medium",
      alignItems: "center",
      gap: "1",
    },
    valueText: {
      textStyle: "xs",
      lineHeight: "1",
      fontWeight: "medium",
    },
  },

  defaultVariants: {
    variant: "solid",
    size: "md",
    shape: "rounded",
  },

  variants: {
    variant: {
      solid: {
        track: {
          bgColor: "neutral.subtle.bg",
        },
        circleTrack: {
          stroke: "neutral.subtle.bg",
        },
        segment: {
          "--progress-segment-bg": "colors.neutral.subtle.bg",
        },
      },
      subtle: {
        track: {
          bgColor: "colorPalette.subtle.bg",
        },
        circleTrack: {
          stroke: "colorPalette.subtle.bg",
        },
        segment: {
          "--progress-segment-bg": "colors.colorPalette.subtle.bg",
        },
      },
      outline: {
        track: {
          borderWidth: "1px",
          borderColor: "colorPalette.outline.border",
        },
        circleTrack: {
          stroke: "colorPalette.subtle.bg",
        },
        segment: {
          "--progress-segment-bg": "transparent",
          borderWidth: "1px",
          borderColor: "colorPalette.outline.border",
          _filled: {
            borderColor: "colorPalette.solid.bg",
          },
        },
      },
    },

    shape: {
      square: {},
      rounded: {
        track: {
          borderRadius: "sm",
        },
        segment: {
          borderRadius: "sm",
        },
      },
      full: {
        track: {
          borderRadius: "full",
        },
        segment: {
          borderRadius: "full",
        },
      },
    },

    striped: {
      true: {
        range: {
          backgroundImage: `linear-gradient(45deg, var(--stripe-color) 25%, transparent 25%, transparent 50%, var(--stripe-color) 50%, var(--stripe-color) 75%, transparent 75%, transparent)`,
          backgroundSize: `var(--stripe-size) var(--stripe-size)`,
          "--stripe-size": "1rem",
          "--stripe-color": {
            _light: "{colors.white.a5}",
            _dark: "{colors.black.a5}",
          },
        },
      },
    },

    animated: {
      true: {
        range: {
          "--animate-from": "var(--stripe-size)",
          animation: "bg-position 1s linear infinite",
        },
      },
    },

    size: {
      xs: {
        circle: {
          "--size": visual("2rem"),
          "--thickness": "2px",
        },
        track: { h: visual("0.375rem") },
        segments: { h: visual("0.375rem") },
      },
      sm: {
        circle: {
          "--size": visual("2.25rem"),
          "--thickness": "2px",
        },
        track: { h: visual("0.5rem") },
        segments: { h: visual("0.5rem") },
      },
      md: {
        circle: {
          "--size": visual("2.5rem"),
          "--thickness": "2px",
        },
        track: { h: visual("0.625rem") },
        segments: { h: visual("0.625rem") },
      },
      lg: {
        circle: {
          "--size": visual("2.75rem"),
          "--thickness": "3px",
        },
        track: { h: visual("0.75rem") },
        segments: { h: visual("0.75rem") },
      },
      xl: {
        circle: {
          "--size": visual("3rem"),
          "--thickness": "4px",
        },
        track: { h: visual("0.875rem") },
        segments: { h: visual("0.875rem") },
      },
    },
  },
});
