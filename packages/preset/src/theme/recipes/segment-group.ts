import { segmentGroupAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlH, controlPx, controlIcon, controlText } from "./control-size";

const tier = (size: ControlSize) => ({
  item: {
    h: controlH(size),
    minW: controlH(size),
    ...controlText(size),
    px: controlPx(size),
    _icon: { boxSize: controlIcon(size) },
  },
});

export const segmentGroup = defineSlotRecipe({
  className: "segment-group",
  slots: segmentGroupAnatomy.keys(),
  base: {
    root: {
      bg: "neutral.subtle.bg",
      borderRadius: "lg",
      boxShadow: "inset 0 0 0px 1px var(--shadow-color)",
      boxShadowColor: "border",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      isolation: "isolate",
      pos: "relative",
      maxWidth: "100%",
      overflowX: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
      _vertical: {
        flexDirection: "column",
        alignItems: "stretch",
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "lg",
      display: "inline-flex",
      flexShrink: "0",
      fontWeight: "medium",
      gap: "2",
      justifyContent: "center",
      position: "relative",
      userSelect: "none",
      cursor: "pointer",
      _disabled: {
        opacity: "0.5",
      },
      "&:has(input:focus-visible)": {
        focusVisibleRing: "outside",
      },

      _before: {
        content: '""',
        position: "absolute",
        bg: "neutral.surface.border",
        transition: "opacity 0.2s",
      },

      _horizontal: {
        _before: {
          insetInlineStart: "0",
          insetBlock: "1.5",
          width: "1px",
        },
      },

      _vertical: {
        _before: {
          insetBlockStart: "0",
          insetInline: "1.5",
          height: "1px",
        },
      },

      "& + &[data-state=checked], &[data-state=checked] + &, &:first-of-type": {
        _before: {
          opacity: "0",
        },
      },
    },

    indicator: {
      bg: "bg.control",
      borderWidth: "1px",
      borderColor: "neutral.surface.border",
      borderRadius: "lg",
      height: "var(--height)",
      pos: "absolute",
      width: "var(--width)",
      zIndex: -1,
    },
  },

  defaultVariants: {
    size: "md",
  },

  variants: {
    size: {
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
    },
    fitted: {
      true: {
        root: {
          display: "flex",
        },
        item: {
          flex: "1",
        },
      },
    },
  },
});
