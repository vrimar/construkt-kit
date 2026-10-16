import { dialogAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

const phoneFullScreen = {
  positioner: { mdDown: { px: "0", padding: "0" } },
  content: {
    mdDown: {
      maxW: "100dvw",
      height: "100dvh",
      "--dialog-full-max-h": "100dvh",
      borderRadius: "0",
      "--dialog-margin": "0",
      pt: `calc(${surface("1rem")} + env(safe-area-inset-top))`,
      pb: `calc(${surface("1rem")} + env(safe-area-inset-bottom))`,
      pl: "env(safe-area-inset-left)",
      pr: "env(safe-area-inset-right)",
    },
  },
  body: { mdDown: { overflowY: "auto", minH: "0" } },
  closeTrigger: {
    mdDown: {
      top: "calc({spacing.3} + env(safe-area-inset-top))",
      insetEnd: "calc({spacing.3} + max(env(safe-area-inset-left), env(safe-area-inset-right)))",
    },
  },
};

export const dialog = defineSlotRecipe({
  className: "dialog",
  slots: dialogAnatomy.extendWith("header", "body", "footer").keys(),
  base: {
    backdrop: {
      background: "black.a7",
      height: "100dvh",
      left: "0",
      position: "fixed",
      top: "0",
      width: "100dvw",
      zIndex: "var(--z-index, {zIndex.modal})",
      _open: {
        animationName: "fade-in",
        animationTimingFunction: "emphasized-in",
        animationDuration: "normal",
      },
      _closed: {
        animationName: "fade-out",
        animationTimingFunction: "emphasized-out",
        animationDuration: "fast",
      },
    },
    positioner: {
      "--dialog-z-index": "zIndex.modal",
      display: "flex",
      height: "100dvh",
      justifyContent: "center",
      left: 0,
      overscrollBehaviorY: "none",
      position: "fixed",
      top: 0,
      width: "100dvw",
      px: { base: "4", sm: "0" },
      zIndex: "calc(var(--dialog-z-index) + var(--layer-index, 0))",
    },

    title: {
      fontWeight: "semibold",
      textStyle: "lg",
    },
    description: {
      color: "fg.muted",
      textStyle: "sm",
    },
    closeTrigger: {
      pos: "absolute",
      top: "3",
      insetEnd: "3",
    },
    content: {
      layerStyle: "modal.surface",
      borderRadius: "lg",
      display: "flex",
      flexDirection: "column",
      my: "var(--dialog-margin, var(--dialog-base-margin))",
      outline: 0,
      position: "relative",
      textStyle: "sm",
      width: "100%",
      zIndex: "calc(var(--dialog-z-index) + var(--layer-index, 0))",
      maxH: "var(--dialog-full-max-h, var(--dialog-scroll-max-h, none))",
      "--dialog-full-max-h": "initial",
      "--dialog-scroll-max-h": "initial",
      py: { base: surface("1rem"), md: surface("1.5rem") },
      gap: { base: surface("1rem"), md: surface("1.5rem") },
      _open: {
        animationDuration: "fast",
      },
      _closed: {
        animationDuration: "fast",
      },
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: surface("0.125rem"),
      px: { base: surface("1rem"), md: surface("1.5rem") },
      flex: "0",
    },
    body: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
      alignItems: "stretch",
      px: { base: surface("1rem"), md: surface("1.5rem") },
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flex: "0",
      gap: surface("0.75rem"),
      px: { base: surface("1rem"), md: surface("1.5rem") },
    },
  },
  defaultVariants: {
    size: "md",
    scrollBehavior: "outside",
    placement: "center",
    motionPreset: "scale",
  },
  variants: {
    motionPreset: {
      scale: {
        content: {
          _open: { animationName: "scale-in, fade-in" },
          _closed: { animationName: "scale-out, fade-out" },
        },
      },
      "slide-in-bottom": {
        content: {
          _open: { animationName: "slide-from-bottom, fade-in" },
          _closed: { animationName: "slide-to-bottom, fade-out" },
        },
      },
      "slide-in-top": {
        content: {
          _open: { animationName: "slide-from-top, fade-in" },
          _closed: { animationName: "slide-to-top, fade-out" },
        },
      },
      "slide-in-left": {
        content: {
          _open: { animationName: "slide-from-left, fade-in" },
          _closed: { animationName: "slide-to-left, fade-out" },
        },
      },
      "slide-in-right": {
        content: {
          _open: { animationName: "slide-from-right, fade-in" },
          _closed: { animationName: "slide-to-right, fade-out" },
        },
      },
      none: {},
    },
    size: {
      xs: { content: { maxW: "xs" } },
      sm: { content: { maxW: "sm" } },
      md: { ...phoneFullScreen, content: { maxW: "md", ...phoneFullScreen.content } },
      lg: { ...phoneFullScreen, content: { maxW: "lg", ...phoneFullScreen.content } },
      xl: { ...phoneFullScreen, content: { maxW: "xl", ...phoneFullScreen.content } },
      cover: {
        ...phoneFullScreen,
        positioner: { padding: surface("2rem"), ...phoneFullScreen.positioner },
        content: {
          width: "100%",
          height: "100%",
          "--dialog-margin": "0",
          ...phoneFullScreen.content,
        },
      },
      full: {
        positioner: {
          px: "0",
        },
        content: {
          maxW: "100dvw",
          minH: "100dvh",
          "--dialog-margin": "0",
          borderRadius: "0",
        },
      },
    },
    placement: {
      center: {
        positioner: {
          alignItems: "center",
        },
        content: {
          "--dialog-base-margin": "auto",
          mx: "auto",
        },
      },
      top: {
        positioner: {
          alignItems: "flex-start",
        },
        content: {
          "--dialog-base-margin": "spacing.16",
          mx: "auto",
        },
      },
      bottom: {
        positioner: {
          alignItems: "flex-end",
        },
        content: {
          "--dialog-base-margin": "spacing.16",
          mx: "auto",
        },
      },
    },
    scrollBehavior: {
      inside: {
        positioner: {
          overflow: "hidden",
        },
        content: {
          "--dialog-scroll-max-h": "calc(100% - 7.5rem)",
        },
        body: {
          overflow: "auto",
        },
      },
      outside: {
        positioner: {
          overflow: "auto",
          pointerEvents: "auto",
        },
      },
    },
  },
});
