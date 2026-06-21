import { listboxAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlPx, controlGap, controlIcon, controlText } from "./control-size";

export const listbox = defineSlotRecipe({
  className: "listbox",
  slots: listboxAnatomy.keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    label: {
      fontWeight: "medium",
      userSelect: "none",
      textStyle: "sm",
    },
    content: {
      background: "neutral.surface.bg",
      display: "flex",
      flexDirection: "column",
      maxH: "96",
      minH: "0",
      outline: 0,
      overflow: "hidden",
      _horizontal: {
        flexDirection: "row",
        maxH: "none",
        maxW: "max-content",
        overflow: "hidden",
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "sm",
      cursor: "pointer",
      display: "flex",
      minWidth: "0",
      justifyContent: "space-between",
      userSelect: "none",
      outline: "0",
      _hover: {
        background: "neutral.surface.bg.hover",
      },
      _highlighted: {
        background: "neutral.surface.bg.hover",
      },
      _checked: {
        color: "colorPalette.plain.fg",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    itemText: {
      flex: "1",
      minWidth: "0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: "semibold",
    },
    itemIndicator: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "colorPalette.plain.fg",
      flexShrink: "0",
    },
    itemGroup: {
      display: "flex",
      flexDirection: "column",
      minWidth: "0",
    },
    itemGroupLabel: {
      alignItems: "flex-start",
      color: "fg.subtle",
      display: "flex",
      flexDirection: "column",
      fontWeight: "medium",
      gap: "1px",
      justifyContent: "center",
      textTransform: "uppercase",
      letterSpacing: "wide",
      _after: {
        content: '""',
        width: "100%",
        height: "1px",
        bg: "border.muted",
      },
    },
    valueText: {
      fontWeight: "normal",
      color: "colorPalette.plain.fg",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: {
        content: { p: "1", gap: "0.5", ...controlText("xs") },
        item: {
          px: controlPx("sm"),
          minH: controlH("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("sm"), height: controlH("sm"), ...controlText("xs") },
        label: controlText("sm"),
      },
      md: {
        content: { p: "1", gap: "0.5", ...controlText("sm") },
        item: {
          px: controlPx("md"),
          minH: controlH("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("md"), height: controlH("md"), ...controlText("xs") },
        label: controlText("sm"),
      },
      lg: {
        content: { p: "1", gap: "0.5", ...controlText("md") },
        item: {
          px: controlPx("lg"),
          minH: controlH("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPx("lg"), height: controlH("lg"), ...controlText("sm") },
        label: controlText("md"),
      },
    },
  },
});
