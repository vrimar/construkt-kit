import { menuAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, dropdownItem, dropdownItemGroupLabel } from "./control-size";

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
        item: dropdownItem("xs"),
        itemGroup: { gap: "0.5" },
        itemGroupLabel: dropdownItemGroupLabel("xs"),
        separator: { mx: "-1", my: "0.5" },
      },
      sm: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("sm"),
          minWidth: "max(var(--reference-width), {sizes.32})",
        },
        item: dropdownItem("sm"),
        itemGroup: { gap: "0.5" },
        itemGroupLabel: dropdownItemGroupLabel("sm"),
        separator: { mx: "-1.5", my: "0.5" },
      },
      md: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("md"),
          minWidth: "max(var(--reference-width), {sizes.40})",
        },
        item: dropdownItem("md"),
        itemGroup: { gap: "0.5" },
        itemGroupLabel: dropdownItemGroupLabel("md"),
        separator: { mx: "-2", my: "0.5" },
      },
      lg: {
        content: {
          p: "1",
          gap: "0.5",
          ...controlText("lg"),
          minWidth: "max(var(--reference-width), {sizes.48})",
        },
        item: dropdownItem("lg"),
        itemGroup: { gap: "0.5" },
        itemGroupLabel: dropdownItemGroupLabel("lg"),
        separator: { mx: "-2.5", my: "0.5" },
      },
      xl: {
        content: {
          p: "1",
          gap: "1",
          ...controlText("xl"),
          minWidth: "max(var(--reference-width), {sizes.56})",
        },
        item: dropdownItem("xl"),
        itemGroup: { gap: "1" },
        itemGroupLabel: dropdownItemGroupLabel("xl"),
        separator: { mx: "-3", my: "0" },
      },
    },
  },
});
