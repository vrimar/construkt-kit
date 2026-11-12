import { defineSlotRecipe } from "@pandacss/dev";

const paneEdge = "var(--nav-rail-pane-border)";

export const navRail = defineSlotRecipe({
  className: "nav-rail",
  slots: ["root", "item", "itemIcon", "itemLabel", "footer"],
  base: {
    root: {
      "--nav-rail-gutter": "{spacing.2.5}",
      "--nav-rail-pane-bg": "{colors.bg}",
      "--nav-rail-pane-border": "{colors.border}",
      position: "relative",
      zIndex: "1",
      display: "flex",
      flexDirection: "column",
      flexShrink: "0",
      gap: "1",
      minH: "0",
      ps: "1",
      pe: "var(--nav-rail-gutter)",
      pt: "0.5",
    },
    item: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1",
      minW: "14",
      h: "14",
      px: "1",
      borderRadius: "md",
      color: "fg.muted",
      cursor: "pointer",
      outline: "0",
      textDecoration: "none",
      userSelect: "none",
      transition: "colors",
      focusVisibleRing: "inside",
      _icon: { boxSize: "5" },
      _hover: { color: "fg" },
      _currentPage: {
        bg: "var(--nav-rail-pane-bg)",
        color: "colorPalette.fg",
        // Reaches across the gutter and 1px into the pane, covering its border so the item joins it.
        "&:not([data-tucked])": {
          marginInlineEnd: "calc(-1 * var(--nav-rail-gutter) - 1px)",
          pe: "calc({spacing.1} + var(--nav-rail-gutter) + 1px)",
          borderEndRadius: "0",
          boxShadow: `0 -1px 0 ${paneEdge}, 0 1px 0 ${paneEdge}, -1px 0 0 ${paneEdge}`,
          _rtl: { boxShadow: `0 -1px 0 ${paneEdge}, 0 1px 0 ${paneEdge}, 1px 0 0 ${paneEdge}` },
        },
      },
      "&[data-tucked]": {
        bg: "var(--nav-rail-pane-bg)",
        color: "colorPalette.fg",
        boxShadow: `inset 0 0 0 1px ${paneEdge}`,
      },
    },
    itemIcon: {
      position: "relative",
      display: "inline-flex",
    },
    itemLabel: {
      fontSize: "0.625rem",
      lineHeight: "1",
      fontWeight: "medium",
      whiteSpace: "nowrap",
      "[aria-current=page] &": {
        fontWeight: "semibold",
        color: "fg",
      },
    },
    footer: {
      display: "flex",
      flexDirection: "column",
      gap: "1",
      mt: "auto",
    },
  },
});
