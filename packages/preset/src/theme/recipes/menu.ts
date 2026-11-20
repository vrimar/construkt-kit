import { defineSlotRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlGap,
  controlH,
  controlPx,
  controlPy,
  controlText,
  dropdownItem,
  dropdownItemGroupLabel,
} from "./control-size";
import { floatingArrow, floatingPositioner } from "./floating";

const menuItem = (size: ControlSize) => ({
  ...dropdownItem(size),
  "&:has(.menu__itemDescription)": { py: controlPy(size) },
});

const groupLabel = (size: ControlSize, captionSize: ControlSize) => ({
  ...dropdownItemGroupLabel(size),
  "&[data-variant=caps]": controlText(captionSize),
});

const LADDER: readonly ControlSize[] = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

const stepDown = (size: ControlSize, steps: number): ControlSize =>
  LADDER[Math.max(0, LADDER.indexOf(size) - steps)] ?? "2xs";

const segments = (size: ControlSize, captionSize: ControlSize) => ({
  segmentGroup: { minH: controlH(size), gap: controlGap(size) },
  segmentLabel: dropdownItemGroupLabel(size),
  segmentTrack: { h: controlH(stepDown(size, 2)) },
  segmentItem: {
    ...controlText(captionSize),
    px: controlPx(stepDown(size, 1)),
  },
});

export const menu = defineSlotRecipe({
  className: "menu",
  slots: [
    "arrow",
    "arrowTip",
    "content",
    "contextTrigger",
    "item",
    "itemGroup",
    "itemGroupLabel",
    "itemIndicator",
    "itemText",
    "positioner",
    "separator",
    "trigger",
    "itemHint",
    "itemDescription",
    "itemSwitch",
    "itemSwitchThumb",
    "segmentGroup",
    "segmentLabel",
    "segmentTrack",
    "segmentItem",
  ],
  base: {
    positioner: floatingPositioner,
    content: {
      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      outline: "0",
      overflow: "hidden",
      overflowY: "auto",
      position: "relative",
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
        bg: "bg.hover",
      },
      "&[data-destructive]": {
        color: "danger.plain.fg",
      },
      "&[data-destructive][data-highlighted]": {
        bg: "danger.subtle.bg",
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
    itemGroup: {
      display: "flex",
      flexDirection: "column",
    },
    itemGroupLabel: {
      alignItems: "flex-start",
      color: "fg.subtle",
      display: "flex",
      flexDirection: "column",
      fontWeight: "medium",
      gap: "1px",
      justifyContent: "center",
      "&[data-variant=caps]": {
        fontWeight: "semibold",
        letterSpacing: "wider",
        textTransform: "uppercase",
      },
    },
    segmentGroup: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      pe: "1",
    },
    segmentLabel: {
      alignItems: "center",
      display: "flex",
      userSelect: "none",
    },
    segmentTrack: {
      alignItems: "stretch",
      bg: "neutral.subtle.bg",
      borderColor: "border",
      borderRadius: "lg",
      borderWidth: "1px",
      display: "inline-flex",
      flexShrink: "0",
      p: "0.5",
    },
    segmentItem: {
      alignItems: "center",
      borderRadius: "md",
      color: "fg.muted",
      cursor: "pointer",
      display: "inline-flex",
      fontWeight: "medium",
      justifyContent: "center",
      outline: "0",
      userSelect: "none",
      whiteSpace: "nowrap",
      _highlighted: {
        bg: "neutral.subtle.bg.hover",
        color: "fg",
      },
      _checked: {
        bg: "bg.control",
        boxShadow: "xs",
        color: "fg",
        _highlighted: {
          bg: "bg.control",
          boxShadow: "sm",
        },
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    itemIndicator: {
      justifyContent: "flex-end",
      display: "flex",
      flex: "1",
      _checked: {
        color: "colorPalette.plain.fg",
      },
      _unchecked: { visibility: "hidden" },
      // A growing indicator would take the free space the hint's auto margin needs to right-align it.
      ".menu__itemHint + &": {
        flex: "none",
      },
    },
    itemSwitch: {
      "--switch-diff": "calc(var(--switch-width) - var(--switch-height))",
      "--switch-x": {
        base: "var(--switch-diff)",
        _rtl: "calc(var(--switch-diff) * -1)",
      },
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      marginInlineStart: "auto",
      width: "var(--switch-width)",
      height: "var(--switch-height)",
      borderRadius: "full",
      bg: "neutral.subtle.bg",
      boxShadow: "inset 0 0 0 1px var(--shadow-color)",
      boxShadowColor: "border.control",
      transition: "colors",
      "[data-checked] > &": {
        bg: "colorPalette.solid.bg",
        boxShadowColor: "colorPalette.solid.bg",
      },
    },
    itemSwitchThumb: {
      width: "var(--switch-height)",
      height: "var(--switch-height)",
      borderRadius: "full",
      bg: "white",
      boxShadow: "xs",
      scale: "0.8",
      transitionProperty: "translate",
      transitionDuration: "fast",
      "[data-checked] > .menu__itemSwitch > &": {
        bg: "colorPalette.solid.fg",
        translate: "var(--switch-x) 0",
      },
    },
    itemHint: {
      color: "fg.subtle",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      marginInlineStart: "auto",
      whiteSpace: "nowrap",
    },
    itemDescription: {
      color: "fg.muted",
      lineClamp: "2",
      maxWidth: "xs",
    },
    arrow: floatingArrow.arrow,
    arrowTip: floatingArrow.arrowTip,
  },
  defaultVariants: {
    size: "md",
    selection: "check",
  },
  variants: {
    selection: {
      check: {},
      tint: {
        item: {
          "&:not([data-switch])": {
            _checked: {
              bg: "colorPalette.subtle.bg",
              _highlighted: { bg: "colorPalette.subtle.bg.hover" },
            },
          },
        },
        itemIndicator: { display: "none" },
      },
    },
    size: {
      xs: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("xs"),
          minWidth: "max(var(--anchor-width), {sizes.28})",
        },
        item: menuItem("xs"),
        itemGroup: { gap: "0.5" },
        itemSwitch: { "--switch-width": "sizes.7", "--switch-height": "sizes.3.5" },
        itemGroupLabel: groupLabel("xs", "xs"),
        itemHint: { ...controlText("xs"), ps: controlGap("xs") },
        itemDescription: controlText("xs"),
        separator: { mx: "-1", my: "0.5" },
        ...segments("xs", "xs"),
      },
      sm: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("sm"),
          minWidth: "max(var(--anchor-width), {sizes.32})",
        },
        item: menuItem("sm"),
        itemGroup: { gap: "0.5" },
        itemSwitch: { "--switch-width": "sizes.7", "--switch-height": "sizes.3.5" },
        itemGroupLabel: groupLabel("sm", "xs"),
        itemHint: { ...controlText("xs"), ps: controlGap("sm") },
        itemDescription: controlText("xs"),
        separator: { mx: "-1.5", my: "0.5" },
        ...segments("sm", "xs"),
      },
      md: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("md"),
          minWidth: "max(var(--anchor-width), {sizes.40})",
        },
        item: menuItem("md"),
        itemGroup: { gap: "0.5" },
        itemSwitch: { "--switch-width": "sizes.8", "--switch-height": "sizes.4" },
        itemGroupLabel: groupLabel("md", "xs"),
        itemHint: { ...controlText("xs"), ps: controlGap("md") },
        itemDescription: controlText("xs"),
        separator: { mx: "-2", my: "0.5" },
        ...segments("md", "xs"),
      },
      lg: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("lg"),
          minWidth: "max(var(--anchor-width), {sizes.48})",
        },
        item: menuItem("lg"),
        itemGroup: { gap: "0.5" },
        itemSwitch: { "--switch-width": "sizes.9", "--switch-height": "sizes.4.5" },
        itemGroupLabel: groupLabel("lg", "sm"),
        itemHint: { ...controlText("sm"), ps: controlGap("lg") },
        itemDescription: controlText("sm"),
        separator: { mx: "-2.5", my: "0.5" },
        ...segments("lg", "sm"),
      },
      xl: {
        content: {
          p: "1",
          gap: "1",
          ...controlText("xl"),
          minWidth: "max(var(--anchor-width), {sizes.56})",
        },
        item: menuItem("xl"),
        itemGroup: { gap: "1" },
        itemSwitch: { "--switch-width": "sizes.10", "--switch-height": "sizes.5" },
        itemGroupLabel: groupLabel("xl", "sm"),
        itemHint: { ...controlText("sm"), ps: controlGap("xl") },
        itemDescription: controlText("sm"),
        separator: { mx: "-3", my: "0" },
        ...segments("xl", "sm"),
      },
    },
  },
});
