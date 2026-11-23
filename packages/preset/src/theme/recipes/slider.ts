import { defineSlotRecipe } from "@pandacss/dev";

import { visual } from "./control-size";
import { fieldLabel } from "./field";

export const slider = defineSlotRecipe({
  className: "slider",
  slots: [
    "root",
    "label",
    "thumb",
    "valueText",
    "track",
    "range",
    "control",
    "markerGroup",
    "marker",
    "draggingIndicator",
    "markerIndicator",
    "markerLabel",
  ],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
      textStyle: "sm",
      position: "relative",
      isolation: "isolate",
      touchAction: "none",
      width: "full",
      cursor: "pointer",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    label: {
      ...fieldLabel,
      WebkitUserSelect: "none",
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      position: "relative",
      touchAction: "none",
      userSelect: "none",
      WebkitUserSelect: "none",
    },
    track: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "full",
      flex: "1",
    },
    range: {
      position: "absolute",
      width: "inherit",
      height: "inherit",
    },
    markerGroup: {
      position: "absolute",
      zIndex: "1",
      pointerEvents: "none",
      userSelect: "none",
      WebkitUserSelect: "none",
    },
    marker: {
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      gap: "calc(var(--slider-thumb-size) / 2)",
      color: "fg.muted",
      textStyle: "md",
      _hidden: { visibility: "hidden" },
    },
    markerIndicator: {
      width: "var(--slider-marker-size)",
      height: "var(--slider-marker-size)",
      borderRadius: "full",
      bg: "colorPalette.solid.fg",
    },
    thumb: {
      position: "absolute",
      width: "var(--slider-thumb-size)",
      height: "var(--slider-thumb-size)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      outline: 0,
      zIndex: "2",
      borderRadius: "full",
      focusVisibleRing: "outside",
      _focus: { zIndex: "3" },
      _dragging: { zIndex: "3" },
      _hidden: { visibility: "hidden" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
    orientation: "horizontal",
  },
  variants: {
    size: {
      sm: {
        root: {
          "--slider-thumb-size": visual("1.125rem"),
          _pointerCoarse: { "--slider-thumb-size": visual("1.375rem") },
          "--slider-track-size": visual("0.375rem"),
          "--slider-marker-center": "7px",
          "--slider-marker-size": "sizes.1",
          "--slider-marker-inset": "3px",
        },
      },
      md: {
        root: {
          "--slider-thumb-size": visual("1.25rem"),
          _pointerCoarse: { "--slider-thumb-size": visual("1.5rem") },
          "--slider-track-size": visual("0.5rem"),
          "--slider-marker-center": "8px",
          "--slider-marker-size": "sizes.1",
          "--slider-marker-inset": "4px",
        },
      },
      lg: {
        root: {
          "--slider-thumb-size": visual("1.375rem"),
          _pointerCoarse: { "--slider-thumb-size": visual("1.75rem") },
          "--slider-track-size": visual("0.625rem"),
          "--slider-marker-center": "9px",
          "--slider-marker-size": "sizes.1",
          "--slider-marker-inset": "5px",
        },
      },
    },
    variant: {
      outline: {
        thumb: {
          bg: "neutral.surface.bg",
          borderWidth: "2px",
          borderColor: "colorPalette.solid.bg",
          boxShadow: "xs",
        },
        range: {
          bg: "colorPalette.solid.bg",
        },
        track: {
          bg: "neutral.subtle.bg",
        },
      },
      solid: {
        thumb: {
          bg: "colorPalette.solid.bg",
          boxShadow: "xs",
        },
        range: {
          bg: "colorPalette.solid.bg",
        },
        track: {
          bg: "neutral.subtle.bg",
        },
      },
      subtle: {
        thumb: {
          bg: "colorPalette.subtle.fg",
          boxShadow: "xs",
        },
        range: {
          bg: "colorPalette.control",
        },
        track: {
          bg: "neutral.subtle.bg",
        },
      },
    },
    orientation: {
      vertical: {
        root: {
          display: "inline-flex",
        },
        control: {
          flexDirection: "column",
          height: "100%",
          minWidth: "var(--slider-thumb-size)",
          "&:has([data-slot=markerLabel])": {
            marginEnd: "4",
          },
        },
        track: {
          width: "var(--slider-track-size)",
        },
        thumb: {
          left: "50%",
          translate: "-50% 0",
        },
        markerGroup: {
          insetStart: "var(--slider-marker-center)",
          insetBlock: "var(--slider-marker-inset)",
        },
        marker: {
          flexDirection: "row",
        },
      },
      horizontal: {
        control: {
          flexDirection: "row",
          width: "100%",
          minHeight: "var(--slider-thumb-size)",
          "&:has([data-slot=markerLabel])": {
            marginBottom: "4",
          },
        },
        track: {
          height: "var(--slider-track-size)",
        },
        thumb: {
          top: "50%",
          translate: "0 -50%",
        },
        markerGroup: {
          top: "var(--slider-marker-center)",
          insetInline: "var(--slider-marker-inset)",
        },
        marker: {
          flexDirection: "column",
        },
      },
    },
  },
});
