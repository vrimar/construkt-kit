import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";
import {
  modalBackdrop,
  modalCloseTrigger,
  modalDescription,
  modalFooter,
  modalInset,
  modalPositioner,
} from "./modal";
import { overlayMotion } from "./overlay-motion";

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
      "[data-slot=header] > &": { top: "auto", insetEnd: "auto" },
    },
  },
};

export const dialog = defineSlotRecipe({
  className: "dialog",
  slots: [
    "trigger",
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
    positioner: {
      ...modalPositioner,
      ...modalBackdrop({ enter: "normal", exit: "fast", exitName: "fade-out" }),
      justifyContent: "center",
      left: 0,
      width: "100dvw",
      px: { base: "4", sm: "0" },
    },

    title: {
      fontWeight: "semibold",
      textStyle: "lg",
    },
    description: modalDescription,
    closeTrigger: modalCloseTrigger("3", "3"),
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
      maxH: "var(--dialog-full-max-h, var(--dialog-scroll-max-h, none))",
      "--dialog-full-max-h": "initial",
      "--dialog-scroll-max-h": "initial",
      py: modalInset,
      gap: modalInset,
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
      px: modalInset,
      flex: "0",
    },
    body: {
      display: "flex",
      flex: "1",
      flexDirection: "column",
      alignItems: "stretch",
      px: modalInset,
    },
    footer: modalFooter,
  },
  defaultVariants: {
    size: "md",
    scrollBehavior: "outside",
    placement: "center",
    motionPreset: "scale",
  },
  variants: {
    motionPreset: {
      scale: { content: overlayMotion("scale-in", "scale-out") },
      "slide-in-bottom": { content: overlayMotion("slide-from-bottom", "slide-to-bottom") },
      "slide-in-top": { content: overlayMotion("slide-from-top", "slide-to-top") },
      "slide-in-left": { content: overlayMotion("slide-from-left", "slide-to-left") },
      "slide-in-right": { content: overlayMotion("slide-from-right", "slide-to-right") },
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
