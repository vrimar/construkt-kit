import { menuAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlGap,
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

export const menu = defineSlotRecipe({
  className: "menu",
  slots: [...menuAnatomy.keys(), "itemHint", "itemDescription"],
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
        item: menuItem("xs"),
        itemGroup: { gap: "0.5" },
        itemGroupLabel: dropdownItemGroupLabel("xs"),
        itemHint: { ...controlText("xs"), ps: controlGap("xs") },
        itemDescription: controlText("xs"),
        separator: { mx: "-1", my: "0.5" },
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
        itemGroupLabel: dropdownItemGroupLabel("sm"),
        itemHint: { ...controlText("xs"), ps: controlGap("sm") },
        itemDescription: controlText("xs"),
        separator: { mx: "-1.5", my: "0.5" },
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
        itemGroupLabel: dropdownItemGroupLabel("md"),
        itemHint: { ...controlText("xs"), ps: controlGap("md") },
        itemDescription: controlText("xs"),
        separator: { mx: "-2", my: "0.5" },
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
        itemGroupLabel: dropdownItemGroupLabel("lg"),
        itemHint: { ...controlText("sm"), ps: controlGap("lg") },
        itemDescription: controlText("sm"),
        separator: { mx: "-2.5", my: "0.5" },
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
        itemGroupLabel: dropdownItemGroupLabel("xl"),
        itemHint: { ...controlText("sm"), ps: controlGap("xl") },
        itemDescription: controlText("sm"),
        separator: { mx: "-3", my: "0" },
      },
    },
  },
});
