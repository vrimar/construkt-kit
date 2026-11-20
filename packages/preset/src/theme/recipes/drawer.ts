import { defineSlotRecipe } from "@pandacss/dev";

import { anchoredHitArea, surface } from "./control-size";
import { modalPositioner } from "./modal";
import { overlayMotion } from "./overlay-motion";

const contentMaxH = "var(--drawer-full-max-h, var(--drawer-placement-max-h, 100dvh))";
const contentPt = "var(--drawer-full-pt, var(--drawer-placement-pt, 0px))";
const contentPb = "var(--drawer-full-pb, var(--drawer-placement-pb, 0px))";
const contentPe = "var(--drawer-full-pe, var(--drawer-placement-pe, 0px))";

export const drawer = defineSlotRecipe({
  className: "drawer",
  slots: [
    "positioner",
    "content",
    "title",
    "description",
    "trigger",
    "grabber",
    "grabberIndicator",
    "closeTrigger",
    "header",
    "body",
    "footer",
  ],
  base: {
    positioner: {
      ...modalPositioner,
      width: "100vw",
      height: "100dvh",
      position: "fixed",
      insetInlineStart: "0",
      top: "0",
      overflow: "visible",
      overscrollBehaviorY: "none",
      _open: { display: "flex" },
      _backdrop: {
        background: "black.a7",
        opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
        animationName: "fade-in",
        animationTimingFunction: "emphasized-in",
        animationDuration: "slow",
      },
      _closed: {
        _backdrop: {
          animationName: "swipe-fade-out",
          animationTimingFunction: "emphasized-out",
          animationDuration: "normal",
        },
      },
      "&[data-no-backdrop]": { _backdrop: { background: "transparent", animation: "none" } },
    },
    content: {
      layerStyle: "modal.surface",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      width: "100%",
      outline: 0,
      maxH: contentMaxH,
      borderTopRadius: "var(--drawer-full-radius, var(--drawer-placement-radius, 0))",
      pt: contentPt,
      pb: contentPb,
      ps: "var(--drawer-full-ps, var(--drawer-placement-ps, 0px))",
      pe: contentPe,
      "&[data-swiping]": { transitionDuration: "0s", willChange: "transform" },
      _startingStyle: { transitionDuration: "0s" },
      "--drawer-safe-start": {
        base: "env(safe-area-inset-left)",
        _rtl: "env(safe-area-inset-right)",
      },
      "--drawer-safe-end": {
        base: "env(safe-area-inset-right)",
        _rtl: "env(safe-area-inset-left)",
      },
      "--drawer-full-max-h": "initial",
      "--drawer-full-radius": "initial",
      "--drawer-full-pt": "initial",
      "--drawer-full-pb": "initial",
      "--drawer-full-ps": "initial",
      "--drawer-full-pe": "initial",
      "--drawer-placement-max-h": "initial",
      "--drawer-placement-radius": "initial",
      "--drawer-placement-pt": "initial",
      "--drawer-placement-pb": "initial",
      "--drawer-placement-ps": "initial",
      "--drawer-placement-pe": "initial",
      maxW: "var(--drawer-max-w)",
      color: "inherit",
      transitionProperty: "transform, scale",
      transitionDuration: "normal",
      transitionTimingFunction: "emphasized-out",
      "&[data-overlay-sheet]": {
        "--available-height": `calc(${contentMaxH} - ${contentPt} - ${contentPb} - {sizes.4})`,
        "& > [data-overlay-sheet-content]": {
          flex: "1 1 auto",
          minHeight: "0",
          maxHeight: "none",
          overflowY: "auto",
          borderWidth: "0",
          borderRadius: "0",
          boxShadow: "none",
          // Consumers size anchored content with style props; a sheet is always full width.
          width: "100% !important",
          minWidth: "0 !important",
          maxWidth: "none !important",
        },
        "& > [data-overlay-sheet-content]:has(~ [data-overlay-sheet-content][data-open])": {
          display: "none",
        },
      },
      _open: {
        animationDuration: "slowest",
        animationTimingFunction: "emphasized-in",
      },
      _closed: {
        animationDuration: "normal",
        animationTimingFunction: "emphasized-out",
      },
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: surface("0.25rem"),
      pt: { base: surface("1rem"), md: surface("1.5rem") },
      pb: surface("1rem"),
      px: { base: surface("1rem"), md: surface("1.5rem") },
      flex: "0",
    },
    body: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      flex: "1",
      overflow: "auto",
      p: { base: surface("1rem"), md: surface("1.5rem") },
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flex: "0",
      gap: surface("0.75rem"),
      py: surface("1rem"),
      px: { base: surface("1rem"), md: surface("1.5rem") },
    },
    title: {
      color: "fg",
      fontWeight: "semibold",
      textStyle: "xl",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
    closeTrigger: {
      pos: "absolute",
      top: `calc({spacing.3} + ${contentPt})`,
      insetEnd: `calc({spacing.3} + ${contentPe})`,
      ...anchoredHitArea,
      "[data-slot=header] > &": { pos: "relative", top: "auto", insetEnd: "auto", flexShrink: "0" },
    },
    grabber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      pt: "2",
      pb: "1",
      cursor: "grab",
      touchAction: "none",
    },
    grabberIndicator: {
      width: "9",
      height: "1",
      borderRadius: "full",
      bg: "border",
    },
  },
  defaultVariants: {
    placement: "end",
    size: "sm",
  },
  variants: {
    size: {
      xs: { content: { "--drawer-size": "{sizes.xs}" } },
      sm: { content: { "--drawer-size": "{sizes.sm}" } },
      md: { content: { "--drawer-size": "{sizes.md}" } },
      lg: { content: { "--drawer-size": "{sizes.lg}" } },
      xl: { content: { "--drawer-size": "{sizes.xl}" } },
      full: {
        content: {
          "--drawer-size": "100vw",
          h: "100dvh",
          "--drawer-full-max-h": "100dvh",
          "--drawer-full-radius": "0",
          "--drawer-full-pt": "env(safe-area-inset-top)",
          "--drawer-full-pb": "env(safe-area-inset-bottom)",
          "--drawer-full-ps": "var(--drawer-safe-start)",
          "--drawer-full-pe": "var(--drawer-safe-end)",
        },
      },
    },
    placement: {
      start: {
        positioner: {
          justifyContent: "flex-start",
          alignItems: "stretch",
        },
        content: {
          "--drawer-max-w": "var(--drawer-size)",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          ...overlayMotion("slide-from-left-full", "slide-to-left-full"),
          _rtl: overlayMotion("slide-from-right-full", "slide-to-right-full"),
        },
      },
      end: {
        positioner: {
          justifyContent: "flex-end",
          alignItems: "stretch",
        },
        content: {
          "--drawer-max-w": "var(--drawer-size)",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          ...overlayMotion("slide-from-right-full", "slide-to-right-full"),
          _rtl: overlayMotion("slide-from-left-full", "slide-to-left-full"),
        },
      },
      top: {
        positioner: {
          justifyContent: "stretch",
          alignItems: "flex-start",
        },
        content: {
          "--drawer-max-w": "100%",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          ...overlayMotion("slide-from-top-full", "slide-to-top-full"),
        },
      },

      bottom: {
        positioner: {
          justifyContent: "stretch",
          alignItems: "flex-end",
        },
        content: {
          "--drawer-max-w": "100%",
          "--drawer-placement-max-h": "round(down, 90dvh, 1px)",
          "--drawer-placement-radius": "radii.2xl",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          "&[data-nested-dialog-open]": {
            scale: "calc(1 - var(--nested-dialogs) * 0.04)",
            transformOrigin: "top",
          },
          ...overlayMotion("slide-from-bottom-full", "slide-to-bottom-full"),
        },
      },
    },
  },
});
