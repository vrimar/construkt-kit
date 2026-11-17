import { defineSlotRecipe } from "@pandacss/dev";

import { controlIcon } from "./control-size";

export const list = defineSlotRecipe({
  className: "list",
  slots: [
    "action",
    "actionIcon",
    "actionContent",
    "actionTitle",
    "actionDescription",
    "actionValue",
    "actionChevron",
  ],
  base: {
    action: {
      display: "flex",
      alignItems: "center",
      gap: "3",
      width: "100%",
      px: "2.5",
      py: "3",
      borderRadius: "md",
      bg: "transparent",
      color: "fg",
      textAlign: "start",
      textDecoration: "none",
      cursor: "pointer",
      outline: "0",
      transition: "colors",
      _hover: {
        bg: "neutral.plain.bg.hover",
      },
      _focusVisible: {
        focusVisibleRing: "inside",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    actionIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      color: "fg.muted",
      _icon: { boxSize: controlIcon("md") },
    },
    actionContent: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5",
      flex: "1",
      minWidth: "0",
    },
    actionTitle: {
      textStyle: "sm",
      fontWeight: "medium",
      truncate: true,
    },
    actionDescription: {
      textStyle: "xs",
      color: "fg.muted",
      overflowWrap: "anywhere",
    },
    actionValue: {
      display: "inline-flex",
      alignItems: "center",
      gap: "3",
      flexShrink: "0",
      textStyle: "sm",
      color: "fg.muted",
      fontVariantNumeric: "tabular-nums",
    },
    actionChevron: {
      display: "inline-flex",
      flexShrink: "0",
      color: "fg.subtle",
      _icon: { boxSize: "4" },
      _rtl: { transform: "scaleX(-1)" },
    },
  },
});
