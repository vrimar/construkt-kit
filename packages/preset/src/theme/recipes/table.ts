import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { onSurface } from "../layer-styles";
import { controlGap, controlPx, controlText } from "./control-size";

/** How far below the top of its scroller a `stickyHeader` table's head sticks; set on the table or an ancestor. */
export const tableGlobalVars: GlobalVarsDefinition = {
  "--table-sticky-offset": { syntax: "*", inherits: true },
};

const rowBg = onSurface("--table-row-bg");

const pinnedShadow = {
  _pinnedLeft: {
    "[data-overflow-x]:not([data-at-left]) &": {
      _after: {
        content: '""',
        position: "absolute",
        pointerEvents: "none",
        top: "0",
        bottom: "-1px",
        insetInlineEnd: "0",
        width: "32px",
        translate: "100% 0",
        boxShadow: "inset",
      },
    },
  },
};

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
      ...controlText("sm"),
      truncate: true,
      px: "var(--table-cell-px)",
      py: "var(--table-cell-py)",
      boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
      shadowColor: "border",
      _pinned: {
        bg: rowBg,
        boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
        overflow: "unset",
        position: "sticky",
        shadowColor: "border",
        zIndex: "1",
      },
      ...pinnedShadow,
    },
    row: {
      bg: "var(--table-row-bg)",
      _last: { "& [data-slot=cell]": { boxShadow: "none" } },
    },
    header: {
      textAlign: "start",
      verticalAlign: "middle",
      boxShadow: "inset 0 -1px 0 0 var(--shadow-color)",
      shadowColor: "border",
      _pinned: {
        position: "sticky",
        bg: rowBg,
        zIndex: "2",
      },
      ...pinnedShadow,
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
      "& [data-slot=cell]": {
        boxShadow: "inset 0 1px 0 0 var(--shadow-color)!",
        shadowColor: "border",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "plain",
  },
  variants: {
    variant: {
      surface: {
        root: { "--table-row-bg": "colors.neutral.surface.bg" },
        header: { bg: "bg.muted" },
      },
      outline: {
        root: { borderWidth: "1px", borderColor: "border", borderRadius: "md", overflow: "hidden" },
        header: { bg: "bg.muted" },
      },
      plain: {},
    },
    striped: {
      true: {
        row: { "&:nth-of-type(odd) [data-slot=cell]": { bg: "bg.muted" } },
      },
    },
    interactive: {
      true: {
        body: {
          "& [data-slot=row]": { _hover: { "--table-row-bg": "colors.bg.hover" } },
        },
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
          top: "var(--table-sticky-offset, 0)",
          position: "sticky",
          zIndex: "2",
          bg: rowBg,
        },
      },
    },
    size: {
      sm: {
        root: { ...controlText("xs") },
        header: { px: controlPx("xs"), py: controlGap("md") },
        cell: { "--table-cell-px": controlPx("xs"), "--table-cell-py": controlGap("md") },
      },
      md: {
        root: { ...controlText("sm") },
        header: { px: controlPx("md"), py: controlGap("2xl") },
        cell: { "--table-cell-px": controlPx("md"), "--table-cell-py": controlGap("2xl") },
      },
    },
  },
});
