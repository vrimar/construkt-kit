import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlPx, controlText } from "./control-size";

export const table = defineSlotRecipe({
  className: "table",
  slots: ["root", "body", "cell", "foot", "head", "header", "row", "caption"],
  base: {
    root: {
      borderCollapse: "collapse",
      fontVariantNumeric: "lining-nums tabular-nums",
      textAlign: "start",
      verticalAlign: "top",
      width: "full",
    },
    cell: {
      alignItems: "center",
      color: "fg.muted",
      textAlign: "start",
      textOverflow: "ellipsis",
      ...controlText("sm"),
      whiteSpace: "nowrap",
      overflow: "hidden",
      boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
      shadowColor: "border",
      _pinned: {
        bg: "inherit",
        boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
        overflow: "unset",
        position: "sticky",
        shadowColor: "border",
        zIndex: "1",
      },
    },
    row: {
      _last: { "& td": { boxShadow: "none" } },
    },
    header: {
      textAlign: "start",
      verticalAlign: "middle",
      boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
      shadowColor: "border",
      _pinned: {
        position: "sticky",
        bg: "inherit",
        zIndex: "2",
      },
    },
    head: {
      color: "fg.muted",
      fontWeight: "semibold",
      textAlign: "start",
      whiteSpace: "nowrap",
      ...controlText("xs"),
    },
    caption: {
      color: "fg.subtle",
      fontWeight: "medium",
    },
    foot: {
      fontWeight: "medium",
      "& td": { boxShadow: "inset 0 1px 0 0 var(--shadow-color)!", shadowColor: "border" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "plain",
  },
  variants: {
    variant: {
      surface: {
        header: { bg: "neutral.surface.bg.hover" },
        row: { bg: "neutral.surface.bg" },
      },
      outline: {
        root: { borderWidth: "1px", borderColor: "border", borderRadius: "md", overflow: "hidden" },
        header: { bg: "neutral.surface.bg.hover" },
      },
      plain: {},
    },
    striped: {
      true: {
        row: { "&:nth-of-type(odd) td": { bg: "neutral.surface.bg.hover" } },
      },
    },
    interactive: {
      true: {
        body: { "& tr": { _hover: { bg: "neutral.surface.bg.hover" } } },
      },
    },
    columnBorder: {
      true: {
        header: { "&:not(:last-of-type)": { borderInlineEndWidth: "1px" } },
        cell: { "&:not(:last-of-type)": { borderInlineEndWidth: "1px" } },
      },
    },
    stickyHeader: {
      true: {
        head: {
          "& :where(tr)": {
            top: "var(--table-sticky-offset, 0)",
            position: "sticky",
            zIndex: "2",
          },
        },
      },
    },
    size: {
      sm: {
        root: { ...controlText("xs") },
        header: { px: controlPx("xs"), py: controlGap("md") },
        cell: { px: controlPx("xs"), py: controlGap("md") },
      },
      md: {
        root: { ...controlText("sm") },
        header: { px: controlPx("md"), py: controlGap("2xl") },
        cell: { px: controlPx("md"), py: controlGap("2xl") },
      },
    },
  },
});
