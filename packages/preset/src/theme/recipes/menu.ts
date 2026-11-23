import { defineSlotRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlGap,
  controlH,
  controlPx,
  controlPxCompact,
  controlPy,
  controlText,
  dropdownItemGroupLabel,
} from "./control-size";
import { dropdownGroupLabelText, dropdownItemBase, dropdownTier, tintedRow } from "./dropdown";
import { floatingArrow, floatingPositioner } from "./floating";
import { enclosedThumb, enclosedTrack } from "./segmented";
import {
  solidSwitchTrack,
  solidSwitchTrackOn,
  switchSize,
  switchThumb,
  switchThumbOn,
  switchTrack,
  switchTravel,
} from "./switch";

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

type MenuSize = "xs" | "sm" | "md" | "lg" | "xl";

interface MenuTier {
  caption: ControlSize;
  track: keyof typeof switchSize;
  minWidth: string;
}

const tier = (size: MenuSize, { caption, track, minWidth }: MenuTier) => {
  const rows = dropdownTier(size);
  return {
    ...rows,
    content: { ...rows.content, minWidth: `max(var(--anchor-width), {sizes.${minWidth}})` },
    item: { ...rows.item, "&:has([data-slot=itemDescription])": { py: controlPy(size) } },
    itemSwitch: switchSize[track],
    itemGroupLabel: {
      ...dropdownItemGroupLabel(size),
      "&[data-variant=caps]": controlText(caption),
    },
    itemHint: { ...controlText(caption), ps: controlGap(size) },
    itemDescription: controlText(caption),
    separator: { mx: `calc(-1 * ${controlPxCompact(size)})`, my: size === "xl" ? "0" : "0.5" },
    ...segments(size, caption),
  };
};

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
      ...dropdownItemBase,
      flex: "0 0 auto",
      textAlign: "start",
      textDecoration: "none",
      width: "100%",
      "&[data-destructive]": {
        color: "danger.plain.fg",
      },
      "&[data-destructive][data-highlighted]": {
        bg: "danger.subtle.bg",
      },
    },
    trigger: {
      focusVisibleRing: "outside",
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
      "&[data-variant=caps]": dropdownGroupLabelText,
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
      ...enclosedTrack,
      alignItems: "stretch",
      display: "inline-flex",
      flexShrink: "0",
      p: "0.5",
    },
    segmentItem: {
      alignItems: "center",
      borderRadius: "md",
      borderWidth: "1px",
      borderColor: "transparent",
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
        ...enclosedThumb,
        color: "fg",
        _highlighted: {
          bg: "bg.control",
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
      "[data-slot=itemHint] + &": {
        flex: "none",
      },
    },
    itemSwitch: {
      ...switchTravel,
      ...switchTrack,
      ...solidSwitchTrack,
      alignItems: "center",
      marginInlineStart: "auto",
      "[data-checked] > &": solidSwitchTrackOn,
    },
    itemSwitchThumb: {
      ...switchThumb,
      borderRadius: "full",
      bg: "white",
      "[data-checked] > [data-slot=itemSwitch] > &": {
        ...switchThumbOn,
        bg: "colorPalette.solid.fg",
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
            _checked: tintedRow,
          },
        },
        itemIndicator: { display: "none" },
      },
    },
    size: {
      xs: tier("xs", { caption: "xs", track: "xs", minWidth: "28" }),
      sm: tier("sm", { caption: "xs", track: "xs", minWidth: "32" }),
      md: tier("md", { caption: "xs", track: "sm", minWidth: "40" }),
      lg: tier("lg", { caption: "sm", track: "md", minWidth: "48" }),
      xl: tier("xl", { caption: "sm", track: "lg", minWidth: "56" }),
    },
  },
});
