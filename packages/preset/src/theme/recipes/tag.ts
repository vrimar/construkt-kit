import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, touchHitArea } from "./control-size";
import { paletteVariant } from "./palette";

const interactive = "&:where(button, a[href], [role=button])";
const selectedStates = "[aria-selected=true], [data-selected], [aria-pressed=true], [data-pressed]";
const selected = `&:is(${selectedStates})`;
const unselected = `&:not(${selectedStates})`;
const elementOffset = "calc(var(--tag-px) * -0.25)";

export const tag = defineSlotRecipe({
  className: "tag",
  slots: ["root", "label", "startElement", "endElement", "closeTrigger"],
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      verticalAlign: "top",
      maxWidth: "100%",
      px: "var(--tag-px)",
      borderRadius: "md",
      fontWeight: "medium",
      textAlign: "start",
      userSelect: "none",
      outline: "0",
      transition: "colors",
      focusVisibleRing: "outside",
      [unselected]: { colorPalette: "neutral" },
      [interactive]: { cursor: "pointer", ...touchHitArea() },
      _icon: {
        boxSize: "var(--tag-element-size)",
        flexShrink: "0",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    label: {
      minWidth: "0",
      truncate: true,
    },
    startElement: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      ms: elementOffset,
    },
    endElement: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      me: elementOffset,
    },
    closeTrigger: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      boxSize: "var(--tag-element-size)",
      me: elementOffset,
      borderRadius: "sm",
      color: "currentColor",
      opacity: "0.6",
      cursor: "pointer",
      outline: "0",
      focusVisibleRing: "inside",
      focusRingWidth: "2px",
      _hover: { opacity: "1" },
      _focusVisible: { opacity: "1" },
      ...touchHitArea(),
    },
  },
  defaultVariants: {
    variant: "surface",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        root: {
          ...paletteVariant.solid,
          [interactive]: { _hover: { bg: "colorPalette.solid.bg.hover" } },
        },
      },
      surface: {
        root: {
          ...paletteVariant.surface,
          [interactive]: {
            _hover: {
              bg: "colorPalette.surface.bg.hover",
              borderColor: "colorPalette.surface.border.hover",
            },
          },
          [selected]: { borderColor: "colorPalette.solid.bg" },
        },
      },
      subtle: {
        root: {
          ...paletteVariant.subtle,
          [interactive]: { _hover: { bg: "colorPalette.subtle.bg.hover" } },
          [selected]: { bg: "colorPalette.subtle.bg.active" },
        },
      },
      outline: {
        root: {
          ...paletteVariant.outline,
          [interactive]: { _hover: { bg: "colorPalette.outline.bg.hover" } },
          [selected]: { borderColor: "colorPalette.solid.bg" },
        },
      },
    },
    size: {
      xs: {
        root: {
          "--tag-px": "spacing.1.5",
          "--tag-element-size": "sizes.3",
          minH: "5",
          gap: "1",
          ...controlText("xs"),
        },
      },
      sm: {
        root: {
          "--tag-px": "spacing.2",
          "--tag-element-size": "sizes.3",
          minH: "6",
          py: "0.5",
          gap: "1",
          ...controlText("xs"),
        },
      },
      md: {
        root: {
          "--tag-px": "spacing.2.5",
          "--tag-element-size": "sizes.3.5",
          minH: "7",
          py: "1",
          gap: "1.5",
          ...controlText("xs"),
        },
      },
      lg: {
        root: {
          "--tag-px": "spacing.3",
          "--tag-element-size": "sizes.4",
          minH: "8",
          py: "1",
          gap: "1.5",
          ...controlText("sm"),
        },
      },
    },
  },
});
