import { menuAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlPx, controlGap, controlIcon, controlText } from "./control-size";

export const menu = defineSlotRecipe({
  className: "menu",
  slots: menuAnatomy.keys(),
  base: {
    content: {
      "--menu-z-index": "zIndex.popover",

      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      outline: "0",
      overflow: "hidden",
      overflowY: "auto",
      position: "relative",
      zIndex: "calc(var(--menu-z-index) + var(--layer-index, 0))",
      _open: {
        animationStyle: "slide-fade-in",
        animationDuration: "fast",
      },
      _closed: {
        animationStyle: "slide-fade-out",
        animationDuration: "faster",
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "md",
      display: "flex",
      flex: "0 0 auto",
      outline: "0",
      textAlign: "start",
      textDecoration: "none",
      userSelect: "none",
      width: "100%",
      _highlighted: {
        bg: "neutral.surface.bg.hover",
      },
      _disabled: {
        layerStyle: "disabled",
      },
      cursor: "pointer",
    },
    trigger: {
      _focusVisible: {
        focusVisibleRing: "outside",
      },
    },
    itemGroupLabel: {
      alignItems: "flex-start",
      color: "fg.subtle",
      display: "flex",
      flexDirection: "column",
      fontWeight: "medium",
      gap: "1px",
      justifyContent: "center",
    },
    itemIndicator: {
      justifyContent: "flex-end",
      display: "flex",
      flex: "1",
      _checked: {
        _icon: {
          color: "colorPalette.plain.fg",
        },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      xs: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("xs"),
          minWidth: "max(var(--reference-width), {sizes.28})",
        },
        item: {
          px: controlPx("xs"),
          minH: controlH("xs"),
          gap: controlGap("xs"),
          _icon: { boxSize: controlIcon("xs") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("xs"), height: controlH("xs") },
        separator: { mx: "-1", my: "0.5" },
      },
      sm: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("sm"),
          minWidth: "max(var(--reference-width), {sizes.32})",
        },
        item: {
          px: controlPx("sm"),
          minH: controlH("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("sm"), height: controlH("sm") },
        separator: { mx: "-1.5", my: "0.5" },
      },
      md: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("md"),
          minWidth: "max(var(--reference-width), {sizes.40})",
        },
        item: {
          px: controlPx("md"),
          minH: controlH("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("md"), height: controlH("md") },
        separator: { mx: "-2", my: "0.5" },
      },
      lg: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("lg"),
          minWidth: "max(var(--reference-width), {sizes.48})",
        },
        item: {
          px: controlPx("lg"),
          minH: controlH("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("lg"), height: controlH("lg") },
        separator: { mx: "-2.5", my: "0.5" },
      },
      xl: {
        content: {
          p: "1",
          gap: "1",
          ...controlText("xl"),
          minWidth: "max(var(--reference-width), {sizes.56})",
        },
        item: {
          px: controlPx("xl"),
          minH: controlH("xl"),
          gap: controlGap("xl"),
          _icon: { boxSize: controlIcon("xl") },
        },
        itemGroup: { gap: "1" },
        itemGroupLabel: { px: controlPx("xl"), height: controlH("xl") },
        separator: { mx: "-3", my: "0" },
      },
    },
  },
});
