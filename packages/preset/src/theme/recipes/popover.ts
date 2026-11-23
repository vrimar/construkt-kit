import { defineSlotRecipe } from "@pandacss/dev";

import { anchoredHitArea, controlPxCompact, controlText, surface } from "./control-size";
import { floatingArrow, floatingContent, floatingPositioner } from "./floating";

export const popover = defineSlotRecipe({
  className: "popover",
  slots: [
    "arrow",
    "arrowTip",
    "anchor",
    "trigger",
    "indicator",
    "positioner",
    "content",
    "title",
    "description",
    "closeTrigger",
    "header",
    "body",
    "footer",
  ],
  base: {
    positioner: floatingPositioner,
    content: {
      ...floatingContent,
      "--popover-padding": surface("1rem"),
      maxHeight: "var(--available-height)",
      width: "xs",
      maxWidth: "calc(100vw - {spacing.4})",
    },
    title: {
      color: "fg",
      fontWeight: "semibold",
      ...controlText("md"),
    },
    description: {
      color: "fg.muted",
      ...controlText("sm"),
    },
    closeTrigger: {
      position: "absolute",
      top: "1",
      insetEnd: "1",
      ...anchoredHitArea,
    },
    header: {
      display: "flex",
      flexDirection: "column",
      pt: "var(--popover-padding)",
      px: "var(--popover-padding)",
    },
    body: {
      p: "var(--popover-padding)",
      display: "flex",
      flex: "1",
      flexDirection: "column",
      "& > .listbox__root": {
        m: "calc(-1 * var(--listbox-text-inset))",
        width: "auto",
      },
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: surface("0.75rem"),
      paddingInline: "var(--popover-padding)",
      paddingBottom: "var(--popover-padding)",
      "&[data-stretch]": {
        justifyContent: "stretch",
        gap: "1",
        paddingInline: `calc(var(--popover-padding) - ${controlPxCompact("md")})`,
        paddingBottom: `calc(var(--popover-padding) - ${controlPxCompact("md")})`,
        "& > *": { flex: "1 1 0", minWidth: "0", justifyContent: "flex-start" },
      },
    },
    arrow: floatingArrow.arrow,
    arrowTip: floatingArrow.arrowTip,
  },
});
