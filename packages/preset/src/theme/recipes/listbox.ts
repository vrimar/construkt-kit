import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import {
  type ControlSize,
  controlGap,
  controlPxCompact,
  controlText,
  dropdownItem,
  dropdownItemGroupLabel,
  dropdownItemGroupSpacing,
} from "./control-size";

/** A popover body reads the inset to pull a listbox flush with its edges. */
export const listboxGlobalVars: GlobalVarsDefinition = {
  "--listbox-text-inset": { syntax: "*", inherits: true },
};

// Must equal content `p` plus item `px`.
const textInset = (size: ControlSize) => ({
  "--listbox-text-inset": `calc({spacing.1} + ${controlPxCompact(size)})`,
});

export const listbox = defineSlotRecipe({
  className: "listbox",
  slots: [
    "label",
    "input",
    "item",
    "itemText",
    "itemIndicator",
    "itemGroup",
    "itemGroupLabel",
    "content",
    "root",
    "valueText",
    "empty",
    "itemHint",
    "itemActions",
  ],
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
        background: "bg.hover",
      },
      _highlighted: {
        background: "bg.hover",
      },
      _selected: {
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
      fontWeight: "medium",
    },
    itemHint: {
      color: "fg.subtle",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      whiteSpace: "nowrap",
    },
    itemActions: {
      display: "inline-flex",
      alignItems: "center",
      gap: "1",
      flexShrink: "0",
      transition: "opacity 0.12s ease-out",
    },
    itemIndicator: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "colorPalette.plain.fg",
      flexShrink: "0",
      _unchecked: { visibility: "hidden" },
    },
    itemGroup: {
      display: "flex",
      flexDirection: "column",
      minWidth: "0",
      ...dropdownItemGroupSpacing,
    },
    itemGroupLabel: {
      alignItems: "flex-start",
      color: "fg.subtle",
      display: "flex",
      flexDirection: "column",
      fontWeight: "semibold",
      gap: "1px",
      justifyContent: "center",
      textTransform: "uppercase",
      letterSpacing: "wider",
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
    actionsPosition: "inline",
    indicatorPosition: "end",
    selection: "check",
  },
  variants: {
    selection: {
      check: {},
      tint: {
        item: {
          _selected: {
            bg: "colorPalette.subtle.bg",
            _hover: { bg: "colorPalette.subtle.bg.hover" },
            _highlighted: { bg: "colorPalette.subtle.bg.hover" },
          },
        },
        itemIndicator: { display: "none" },
      },
    },
    // Selected-item indicator placement. `start` reserves a constant logical-start gutter and
    // pins the indicator into it (absolute → out of flow), so rows stay aligned and text never
    // shifts when the indicator hides on selection change.
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
        itemActions: { _unrevealed: { opacity: "0" } },
      },
    },
    actionsPosition: {
      inline: {},
      overlay: {
        item: { position: "relative" },
        itemActions: {
          position: "absolute",
          insetInlineEnd: "1",
          top: "50%",
          translate: "0 -50%",
          px: "0.5",
          borderRadius: "sm",
          bg: "neutral.surface.bg",
          boxShadow: "sm",
        },
      },
    },
    size: {
      xs: {
        root: textInset("xs"),
        content: { p: "1", gap: "0.5", ...controlText("2xs") },
        item: dropdownItem("xs"),
        itemHint: { ...controlText("2xs"), ps: controlGap("xs") },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { ...dropdownItemGroupLabel("xs"), ...controlText("2xs") },
        label: controlText("xs"),
      },
      sm: {
        root: textInset("sm"),
        content: { p: "1", gap: "0.5", ...controlText("xs") },
        item: dropdownItem("sm"),
        itemHint: { ...controlText("2xs"), ps: controlGap("sm") },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { ...dropdownItemGroupLabel("sm"), ...controlText("xs") },
        label: controlText("sm"),
      },
      md: {
        root: textInset("md"),
        content: { p: "1", gap: "0.5", ...controlText("sm") },
        item: dropdownItem("md"),
        itemHint: { ...controlText("xs"), ps: controlGap("md") },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { ...dropdownItemGroupLabel("md"), ...controlText("xs") },
        label: controlText("sm"),
      },
      lg: {
        root: textInset("lg"),
        content: { p: "1", gap: "0.5", ...controlText("md") },
        item: dropdownItem("lg"),
        itemHint: { ...controlText("xs"), ps: controlGap("lg") },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { ...dropdownItemGroupLabel("lg"), ...controlText("sm") },
        label: controlText("md"),
      },
    },
  },
});
