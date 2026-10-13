import { toastAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlText, surface } from "./control-size";

export const toast = defineSlotRecipe({
  className: "toast",
  jsx: ["Toaster", /Toast\..+/],
  slots: toastAnatomy.keys(),
  base: {
    root: {
      alignItems: "start",
      background: "bg",
      borderRadius: "lg",
      boxShadow: "lg",
      display: "flex",
      gap: surface("1rem"),
      height: "var(--height)",
      // Don't force 384px on mobile — `width: full` + the Toaster's inset size it instead.
      minWidth: { base: "0", md: "sm" },
      opacity: "var(--opacity)",
      overflowWrap: "anywhere",
      p: surface("1rem"),
      position: "relative",
      scale: "var(--scale)",
      transitionDuration: "slow",
      transitionProperty: "translate, scale, opacity, height",
      transitionTimingFunction: "default",
      translate: "var(--x) var(--y)",
      width: "full",
      willChange: "translate, opacity, scale",
      zIndex: "var(--z-index)",
      _icon: {
        flexShrink: "0",
      },
      "& > svg[data-type=info]": {
        color: "info",
      },
      "& > svg[data-type=success]": {
        color: "success",
      },
      "& > svg[data-type=warning]": {
        color: "warning",
      },
      "& > svg[data-type=error]": {
        color: "error",
      },
    },
    title: {
      color: "fg",
      fontWeight: "medium",
      ...controlText("sm"),
    },
    description: {
      color: "fg.muted",
      ...controlText("sm"),
    },
    actionTrigger: {
      color: "colorPalette.plain.fg",
      cursor: "pointer",
      fontWeight: "semibold",
      ...controlText("sm"),
    },
    closeTrigger: {
      position: "absolute",
      top: "2",
      insetEnd: "2",
    },
  },
});
