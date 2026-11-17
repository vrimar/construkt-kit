import { menuAnatomy } from "@ark-ui/react/anatomy";
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
import { floatingArrow } from "./floating-arrow";

const menuItem = (size: ControlSize) => ({
  ...dropdownItem(size),
  "&:has([data-part=item-description])": { py: controlPy(size) },
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
    ...menuAnatomy.keys(),
    "itemHint",
    "itemDescription",
    "segmentGroup",
    "segmentLabel",
    "segmentTrack",
    "segmentItem",
  ],
  base: {
    content: {
      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      outline: "0",
      overflow: "hidden",
      overflowY: "auto",
      position: "relative",
      zIndex: "calc(var(--z-index-popover) + var(--layer-index, 0))",
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
      "&[data-highlighted]": {
        bg: "neutral.subtle.bg.hover",
        color: "fg",
      },
      "&[data-state=checked]": {
        bg: "bg.control",
        boxShadow: "xs",
        color: "fg",
      },
      "&[data-state=checked][data-highlighted]": {
        bg: "bg.control",
        boxShadow: "sm",
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
      "&[data-state=unchecked]": { visibility: "hidden" },
      // A growing indicator would take the free space the hint's auto margin needs to right-align it.
      "[data-part=item-hint] + &": {
        flex: "none",
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
          "&[data-state=checked]": { bg: "colorPalette.subtle.bg" },
          "&[data-state=checked][data-highlighted]": { bg: "colorPalette.subtle.bg.hover" },
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
          minWidth: "max(var(--reference-width), {sizes.28})",
        },
        item: menuItem("xs"),
        itemGroup: { gap: "0.5" },
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
          minWidth: "max(var(--reference-width), {sizes.32})",
        },
        item: menuItem("sm"),
        itemGroup: { gap: "0.5" },
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
          minWidth: "max(var(--reference-width), {sizes.40})",
        },
        item: menuItem("md"),
        itemGroup: { gap: "0.5" },
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
          minWidth: "max(var(--reference-width), {sizes.48})",
        },
        item: menuItem("lg"),
        itemGroup: { gap: "0.5" },
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
          minWidth: "max(var(--reference-width), {sizes.56})",
        },
        item: menuItem("xl"),
        itemGroup: { gap: "1" },
        itemGroupLabel: groupLabel("xl", "sm"),
        itemHint: { ...controlText("sm"), ps: controlGap("xl") },
        itemDescription: controlText("sm"),
        separator: { mx: "-3", my: "0" },
        ...segments("xl", "sm"),
      },
    },
  },
});
