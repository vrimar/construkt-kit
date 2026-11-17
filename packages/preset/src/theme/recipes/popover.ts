import { popoverAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlPxCompact, controlText, surface } from "./control-size";
import { floatingArrow } from "./floating-arrow";

export const popover = defineSlotRecipe({
  className: "popover",
  slots: popoverAnatomy.extendWith("header", "body", "footer").keys(),
  base: {
    content: {
      "--popover-padding": surface("1rem"),

      layerStyle: "floating.surface",
      display: "flex",
      flexDirection: "column",
      maxHeight: "var(--available-height)",
      outline: "0",
      position: "relative",
      ...controlText("sm"),
      transformOrigin: "var(--transform-origin)",
      width: "xs",
      maxWidth: "calc(100vw - {spacing.4})",
      zIndex: "calc(var(--z-index-popover) + var(--layer-index, 0))",
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
      "& > [data-scope=listbox][data-part=root]": {
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
