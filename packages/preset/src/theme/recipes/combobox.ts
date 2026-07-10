import { comboboxAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import {
  controlHCompact,
  controlPx,
  controlPxCompact,
  controlGap,
  controlIcon,
  controlText,
} from "./control-size";
import { input } from "./input";

export const combobox = defineSlotRecipe({
  className: "combobox",
  slots: comboboxAnatomy.extendWith("indicatorGroup").keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    label: {
      textStyle: "label",
    },
    input: {
      ...input.base,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    control: {
      position: "relative",
    },
    content: {
      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      minWidth: "max(var(--reference-width), {sizes.40})",
      outline: "0",
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
      "&[data-empty]:not(:has([data-scope=combobox][data-part=empty]))": {
        opacity: 0,
      },
    },
    item: {
      alignItems: "center",
      borderRadius: "sm",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
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
      _after: {
        content: '""',
        width: "100%",
        height: "1px",
        bg: "border",
      },
    },
    itemIndicator: {
      color: "colorPalette.plain.fg",
    },
    indicatorGroup: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1",
      pos: "absolute",
      insetEnd: "0",
      top: "0",
      bottom: "0",
    },
    trigger: {
      color: "fg.subtle",
    },
    clearTrigger: {
      color: "fg.muted",
    },
    empty: {
      display: "flex",
      alignItems: "center",
      color: "fg.subtle",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        input: input.variants.variant.outline,
      },
      surface: {
        input: input.variants.variant.surface,
      },
      subtle: {
        input: input.variants.variant.subtle,
      },
    },
    size: {
      xs: {
        input: {
          ...input.variants.size.xs,
          pe: "12",
        },
        content: { p: "1", gap: "0.5", ...controlText("xs") },
        item: {
          px: controlPxCompact("xs"),
          minH: controlHCompact("xs"),
          gap: controlGap("xs"),
          _icon: { boxSize: controlIcon("xs") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPxCompact("xs"), height: controlHCompact("xs") },
        indicatorGroup: { px: controlPx("xs"), _icon: { boxSize: controlIcon("xs") } },
        empty: { px: controlPxCompact("xs"), minH: controlHCompact("xs") },
      },
      sm: {
        input: {
          ...input.variants.size.sm,
          pe: "14",
        },
        content: { p: "1", gap: "0.5", ...controlText("sm") },
        item: {
          px: controlPxCompact("sm"),
          minH: controlHCompact("sm"),
          gap: controlGap("sm"),
          _icon: { boxSize: controlIcon("sm") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPxCompact("sm"), height: controlHCompact("sm") },
        indicatorGroup: { px: controlPx("sm"), _icon: { boxSize: controlIcon("sm") } },
        empty: { px: controlPxCompact("sm"), minH: controlHCompact("sm") },
      },
      md: {
        input: {
          ...input.variants.size.md,
          pe: "14",
        },
        content: { p: "1", gap: "0.5", ...controlText("md") },
        indicatorGroup: { px: controlPx("md"), _icon: { boxSize: controlIcon("md") } },
        item: {
          px: controlPxCompact("md"),
          minH: controlHCompact("md"),
          gap: controlGap("md"),
          _icon: { boxSize: controlIcon("md") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPxCompact("md"), height: controlHCompact("md") },
        empty: { px: controlPxCompact("md"), minH: controlHCompact("md") },
      },
      lg: {
        input: {
          ...input.variants.size.lg,
          pe: "16",
        },
        content: { p: "1", gap: "0.5", ...controlText("lg") },
        item: {
          px: controlPxCompact("lg"),
          minH: controlHCompact("lg"),
          gap: controlGap("lg"),
          _icon: { boxSize: controlIcon("lg") },
        },
        itemGroup: { gap: "0.5" },
        itemGroupLabel: { px: controlPxCompact("lg"), height: controlHCompact("lg") },
        indicatorGroup: { px: controlPx("lg"), _icon: { boxSize: controlIcon("lg") } },
        empty: { px: controlPxCompact("lg"), minH: controlHCompact("lg") },
      },
      xl: {
        input: {
          ...input.variants.size.xl,
          pe: "16",
        },
        content: { p: "1", gap: "1", ...controlText("xl") },
        item: {
          px: controlPxCompact("xl"),
          minH: controlHCompact("xl"),
          gap: controlGap("xl"),
          _icon: { boxSize: controlIcon("xl") },
        },
        itemGroup: { gap: "1" },
        itemGroupLabel: { px: controlPxCompact("xl"), height: controlHCompact("xl") },
        indicatorGroup: { px: controlPx("xl"), _icon: { boxSize: controlIcon("xl") } },
        empty: { px: controlPxCompact("xl"), minH: controlHCompact("xl") },
      },
    },
  },
});
