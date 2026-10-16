import { drawerAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

export const drawer = defineSlotRecipe({
  className: "drawer",
  slots: drawerAnatomy.extendWith("header", "body", "footer").keys(),
  base: {
    backdrop: {
      background: "black.a7",
      position: "fixed",
      insetInlineStart: "0",
      top: "0",
      width: "100vw",
      height: "100dvh",
      zIndex: "var(--z-index, {zIndex.modal})",
      opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
      _open: {
        animationName: "fade-in",
        animationTimingFunction: "emphasized-in",
        animationDuration: "slow",
      },
      _closed: {
        animationName: "swipe-fade-out",
        animationTimingFunction: "emphasized-out",
        animationDuration: "normal",
      },
    },
    positioner: {
      "--drawer-z-index": "zIndex.modal",
      display: "flex",
      width: "100vw",
      height: "100dvh",
      position: "fixed",
      insetInlineStart: "0",
      top: "0",
      zIndex: "calc(var(--drawer-z-index) + var(--layer-index, 0))",
      overscrollBehaviorY: "none",
    },
    content: {
      layerStyle: "modal.surface",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      width: "100%",
      outline: 0,
      zIndex: "calc(var(--drawer-z-index) + var(--layer-index, 0))",
      maxH: "var(--drawer-full-max-h, var(--drawer-placement-max-h, 100dvh))",
      borderTopRadius: "var(--drawer-full-radius, var(--drawer-placement-radius, 0))",
      pt: "var(--drawer-full-pt, var(--drawer-placement-pt, 0px))",
      pb: "var(--drawer-full-pb, var(--drawer-placement-pb, 0px))",
      ps: "var(--drawer-full-ps, var(--drawer-placement-ps, 0px))",
      pe: "var(--drawer-full-pe, var(--drawer-placement-pe, 0px))",
      "--drawer-safe-start": { base: "env(safe-area-inset-left)", _rtl: "env(safe-area-inset-right)" },
      "--drawer-safe-end": { base: "env(safe-area-inset-right)", _rtl: "env(safe-area-inset-left)" },
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
      // Overlapping variants resolve here: Panda 2 emits variant rules in usage-dependent order.
      maxW: "var(--drawer-max-w)",
      color: "inherit",
      transitionProperty: "transform, scale",
      transitionDuration: "normal",
      transitionTimingFunction: "emphasized-out",
      "&[data-overlay-sheet]": {
        "--available-height": "calc(90dvh - {sizes.4} - env(safe-area-inset-bottom))",
        "--reference-width": "100%",
        "& [data-part=arrow]": { display: "none" },
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
          // The frame's modal layer sits above the overlay's, which zag sets inline to none.
          pointerEvents: "auto !important",
        },
        "& > [data-overlay-sheet-content]:has(~ [data-overlay-sheet-content][data-state=open])": {
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
      top: "calc({spacing.3} + var(--drawer-full-pt, var(--drawer-placement-pt, 0px)))",
      insetEnd: "calc({spacing.3} + var(--drawer-full-pe, var(--drawer-placement-pe, 0px)))",
    },
    grabber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
      pt: "2",
      pb: "1",
      cursor: "grab",
    },
    grabberIndicator: {
      width: "9",
      height: "1",
      borderRadius: "full",
      bg: "border",
    },
    swipeArea: {
      position: "fixed",
      zIndex: "var(--drawer-z-index, {zIndex.modal})",
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
        swipeArea: { insetBlock: "0", insetInlineStart: "0", width: "6" },
        content: {
          "--drawer-max-w": "var(--drawer-size)",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          _open: {
            animationName: {
              base: "slide-from-left-full, fade-in",
              _rtl: "slide-from-right-full, fade-in",
            },
          },
          _closed: {
            animationName: {
              base: "slide-to-left-full, fade-out",
              _rtl: "slide-to-right-full, fade-out",
            },
          },
        },
      },
      end: {
        positioner: {
          justifyContent: "flex-end",
          alignItems: "stretch",
        },
        swipeArea: { insetBlock: "0", insetInlineEnd: "0", width: "6" },
        content: {
          "--drawer-max-w": "var(--drawer-size)",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          _open: {
            animationName: {
              base: "slide-from-right-full, fade-in",
              _rtl: "slide-from-left-full, fade-in",
            },
          },
          _closed: {
            animationName: {
              base: "slide-to-right-full, fade-out",
              _rtl: "slide-to-left-full, fade-out",
            },
          },
        },
      },
      top: {
        positioner: {
          justifyContent: "stretch",
          alignItems: "flex-start",
        },
        swipeArea: { insetInline: "0", top: "0", height: "6" },
        content: {
          "--drawer-max-w": "100%",
          "--drawer-placement-pt": "env(safe-area-inset-top)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          _open: { animationName: "slide-from-top-full, fade-in" },
          _closed: { animationName: "slide-to-top-full, fade-out" },
        },
      },

      bottom: {
        positioner: {
          justifyContent: "stretch",
          alignItems: "flex-end",
        },
        swipeArea: { insetInline: "0", bottom: "0", height: "6" },
        content: {
          "--drawer-max-w": "100%",
          "--drawer-placement-max-h": "90dvh",
          "--drawer-placement-radius": "radii.2xl",
          "--drawer-placement-pb": "env(safe-area-inset-bottom)",
          "--drawer-placement-ps": "var(--drawer-safe-start)",
          "--drawer-placement-pe": "var(--drawer-safe-end)",
          "&[data-nested-drawer-open]": {
            scale: "calc(1 - var(--nested-drawers) * 0.04)",
            transformOrigin: "top",
          },
          _open: { animationName: "slide-from-bottom-full, fade-in" },
          _closed: { animationName: "slide-to-bottom-full, fade-out" },
        },
      },
    },
  },
});
