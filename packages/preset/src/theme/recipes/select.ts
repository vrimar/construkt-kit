import { selectAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlPx, controlGap, controlIcon, controlText } from "./control-size";

export const select = defineSlotRecipe({
  className: "select",
  slots: selectAnatomy.extendWith("indicatorGroup").keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    content: {
      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      minWidth: "max(var(--reference-width), {sizes.40})",
      outline: 0,
      overflowY: "auto",
      zIndex: "dropdown",
      _open: {
        animationStyle: "slide-fade-in",
        animationDuration: "slow",
      },
      _closed: {
        animationStyle: "slide-fade-out",
        animationDuration: "fastest",
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "sm",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      userSelect: "none",
      _hover: {
        background: "neutral.surface.bg.hover",
      },
      _highlighted: {
        background: "neutral.surface.bg.hover",
      },
      _selected: {},
      _disabled: {
        layerStyle: "disabled",
      },
    },
    indicatorGroup: {
      display: "flex",
      alignItems: "center",
      gap: "1",
      pointerEvents: "none",
    },
    indicator: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: { base: "fg.subtle" },
    },
    itemGroupLabel: {
      alignItems: "flex-start",
      color: "fg.subtle",
      display: "flex",
      flexDirection: "column",
      fontWeight: "medium",
      gap: "1px",
      justifyContent: "center",
      _after: {
        content: '""',
        width: "100%",
        height: "1px",
        bg: "border.muted",
      },
    },
    itemIndicator: {
      color: "colorPalette.plain.fg",
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
      textStyle: "sm",
    },
    trigger: {
      alignItems: "center",
      borderRadius: "md",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      minWidth: "0",
      outline: "0",
      textAlign: "start",
      transition: "common",
      userSelect: "none",
      width: "full",
      _placeholderShown: {
        color: "fg.subtle",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    valueText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        trigger: {
          borderWidth: "1px",
          borderColor: "neutral.outline.border",

          focusVisibleRing: "inside",
        },
      },
      surface: {
        trigger: {
          bg: "neutral.surface.bg",
          borderWidth: "1px",
          borderColor: "neutral.surface.border",

          focusVisibleRing: "inside",
        },
      },
    },
    size: {
      xs: {
        content: { p: "1", gap: "0.5", ...controlText("xs") },
        item: {
          px: controlPx("xs"),
          minH: controlH("xs"),
          gap: controlGap("xs"),
          _icon: { boxSize: controlIcon("xs") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("xs"), height: controlH("xs") },
        trigger: {
          px: controlPx("xs"),
          h: controlH("xs"),
          ...controlText("xs"),
          gap: controlGap("xs"),
          _icon: { boxSize: controlIcon("xs") },
        },
      },
      sm: {
        content: { p: "1", gap: "0.5", ...controlText("sm") },
        item: {
          px: controlPx("sm"),
          minH: controlH("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("sm"), height: controlH("sm") },
        trigger: {
          px: controlPx("sm"),
          h: controlH("sm"),
          ...controlText("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
      },
      md: {
        content: { p: "1", gap: "0.5", ...controlText("md") },
        item: {
          px: controlPx("md"),
          minH: controlH("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("md"), height: controlH("md") },
        trigger: {
          px: controlPx("md"),
          h: controlH("md"),
          ...controlText("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
      },
      lg: {
        content: { p: "1", gap: "0.5", ...controlText("lg") },
        item: {
          px: controlPx("lg"),
          minH: controlH("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("lg"), height: controlH("lg") },
        trigger: {
          px: controlPx("lg"),
          h: controlH("lg"),
          ...controlText("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
      },
      xl: {
        content: { p: "1", gap: "1", ...controlText("xl") },
        item: {
          px: controlPx("xl"),
          minH: controlH("xl"),
          gap: controlGap("xl"),
          _icon: { boxSize: controlIcon("xl") },
        },
        itemGroup: { gap: "1" },
        itemGroupLabel: { px: controlPx("xl"), height: controlH("xl") },
        trigger: {
          px: controlPx("xl"),
          h: controlH("xl"),
          ...controlText("xl"),
          gap: controlGap("xl"),
          _icon: { boxSize: controlIcon("xl") },
        },
      },
    },
  },
});
