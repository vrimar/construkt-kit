import { toastAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const toast = defineSlotRecipe({
  className: "toast",
  jsx: ["Toaster", /Toast\.+/],
  slots: toastAnatomy.keys(),
  base: {
    root: {
      alignItems: "start",
      background: "bg",
      borderRadius: "lg",
      boxShadow: "lg",
      display: "flex",
      gap: "4",
      height: "var(--height)",
      minWidth: "sm",
      opacity: "var(--opacity)",
      overflowWrap: "anywhere",
      p: "4",
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
      "&[data-type=info]": {
        _icon: { color: "info" },
      },
      "&[data-type=success]": {
        _icon: { color: "success" },
      },
      "&[data-type=warning]": {
        _icon: { color: "warning" },
      },
      "&[data-type=error]": {
        _icon: { color: "error" },
      },
    },
    title: {
      color: "fg",
      fontWeight: "medium",
      textStyle: "sm",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
    actionTrigger: {
      color: "colorPalette.plain.fg",
      cursor: "pointer",
      fontWeight: "semibold",
      textStyle: "sm",
    },
    closeTrigger: {
      position: "absolute",
      top: "2",
      insetEnd: "2",
    },
  },
});
