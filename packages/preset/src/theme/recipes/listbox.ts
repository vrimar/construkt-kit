import { listboxAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import {
  controlHCompact,
  controlPxCompact,
  controlGap,
  controlIcon,
  controlText,
} from "./control-size";

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
    actionsVisibility: "hover",
    indicatorPosition: "end",
  },
  variants: {
    // Selected-item indicator placement. `start` reserves a constant logical-start gutter and
    // pins the indicator into it (absolute → out of flow), so rows stay aligned and text never
    // shifts when Ark toggles the indicator's `hidden` attribute on selection change.
    indicatorPosition: {
      end: {},
      start: {
        item: { position: "relative" },
        itemText: { marginInlineStart: "6" },
        itemIndicator: {
          position: "absolute",
          insetInlineStart: "1",
          top: "0",
          bottom: "0",
        },
      },
      none: {
        itemIndicator: { display: "none" },
      },
    },
    actionsVisibility: {
      always: {},
      hover: {
        item: {
          "& [data-listbox-item-action]": {
            opacity: "0",
            transition: "opacity 0.12s ease-out",
          },
          "&:hover [data-listbox-item-action], &[data-highlighted] [data-listbox-item-action], &:focus-within [data-listbox-item-action]":
            {
              opacity: "1",
            },
        },
      },
    },
    size: {
      xs: {
        content: { p: "1", gap: "0.5", ...controlText("2xs") },
        item: {
          px: controlPxCompact("xs"),
          minH: controlHCompact("xs"),
          gap: controlGap("xs"),
          _icon: { boxSize: controlIcon("xs") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: {
          px: controlPxCompact("xs"),
          height: controlHCompact("xs"),
          ...controlText("2xs"),
        },
        label: controlText("xs"),
      },
      sm: {
        content: { p: "1", gap: "0.5", ...controlText("xs") },
        item: {
          px: controlPxCompact("sm"),
          minH: controlHCompact("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: {
          px: controlPxCompact("sm"),
          height: controlHCompact("sm"),
          ...controlText("xs"),
        },
        label: controlText("sm"),
      },
      md: {
        content: { p: "1", gap: "0.5", ...controlText("sm") },
        item: {
          px: controlPxCompact("md"),
          minH: controlHCompact("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: {
          px: controlPxCompact("md"),
          height: controlHCompact("md"),
          ...controlText("xs"),
        },
        label: controlText("sm"),
      },
      lg: {
        content: { p: "1", gap: "0.5", ...controlText("md") },
        item: {
          px: controlPxCompact("lg"),
          minH: controlHCompact("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: {
          px: controlPxCompact("lg"),
          height: controlHCompact("lg"),
          ...controlText("sm"),
        },
        label: controlText("md"),
      },
    },
  },
});
