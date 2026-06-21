import { defineSlotRecipe } from "@pandacss/dev";

import { visual } from "./control-size";

export const scrollArea = defineSlotRecipe({
  className: "scroll-area",
  slots: ["root", "viewport", "content", "scrollbar", "thumb", "corner"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      width: "full",
      height: "full",
      position: "relative",
      overflow: "hidden",
      "--scrollbar-margin": "0px",
      "--scrollbar-size": "calc(var(--thumb-size) + calc(var(--scrollbar-margin) * 2))",
    },
    viewport: {
      display: "flex",
      flexDirection: "column",
      height: "full",
      width: "full",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      "&[data-overflow-x] [data-pinned]": {
        _after: {
          content: '""',
          position: "absolute",
          pointerEvents: "none",
          top: "0",
          bottom: "-1px",
          width: "32px",
        },
      },
      '&[data-overflow-x]:not([data-at-left]) [data-pinned="left"]': {
        _after: {
          insetInlineEnd: "0",
          translate: "100% 0",
          boxShadow: "inset",
        },
      },
    },
    scrollbar: {
      alignItems: "center",
      display: "flex",
      position: "relative",
      touchAction: "none",
      userSelect: "none",
      zIndex: "overlay",
      _vertical: {
        flexDirection: "column",
        width: "var(--scrollbar-size)",
        py: "var(--scrollbar-margin)",
        "&:not([data-overflow-y])": {
          display: "none",
        },
      },
      _horizontal: {
        flexDirection: "row",
        height: "var(--scrollbar-size)",
        px: "var(--scrollbar-margin)",
        "&:not([data-overflow-x])": {
          display: "none",
        },
      },
    },
    thumb: {
      borderRadius: "full",
      bg: "var(--thumb-bg)",
      transitionDuration: "normal",
      transitionProperty: "background, color, box-shadow",
      transitionTimingFunction: "default",
      _vertical: { width: "var(--thumb-size)" },
      _horizontal: { height: "var(--thumb-size)" },
    },
    corner: {},
  },
  defaultVariants: {
    size: "md",
    scrollbar: "auto",
    fadeEdges: false,
  },
  variants: {
    fadeEdges: {
      true: {
        root: {
          "--scroll-area-fade-color": "white",
          "--scroll-area-fade-size": "sizes.8",
          _before: {
            content: '""',
            pointerEvents: "none",
            position: "absolute",
            insetInlineStart: "0",
            insetInlineEnd: "0",
            top: "0",
            height: "var(--scroll-area-fade-size)",
            backgroundImage:
              "linear-gradient(to bottom, var(--scroll-area-fade-color) 0%, var(--scroll-area-fade-color) 30%, transparent 100%)",
            opacity: "0",
            transitionDuration: "normal",
            transitionProperty: "opacity",
            transitionTimingFunction: "default",
            zIndex: "docked",
          },
          _after: {
            content: '""',
            pointerEvents: "none",
            position: "absolute",
            insetInlineStart: "0",
            insetInlineEnd: "0",
            bottom: "0",
            height: "var(--scroll-area-fade-size)",
            backgroundImage:
              "linear-gradient(to top, var(--scroll-area-fade-color) 0%, var(--scroll-area-fade-color) 30%, transparent 100%)",
            opacity: "0",
            transitionDuration: "normal",
            transitionProperty: "opacity",
            transitionTimingFunction: "default",
            zIndex: "docked",
          },
          "&:has([data-part=viewport][data-overflow-y]:not([data-at-top]))": {
            _before: {
              opacity: "1",
            },
          },
          "&:has([data-part=viewport][data-overflow-y]:not([data-at-bottom]))": {
            _after: {
              opacity: "1",
            },
          },
        },
      },
      false: {},
    },
    scrollbar: {
      auto: {
        scrollbar: {
          "&[data-scrolling], &[data-hover]": {
            "--thumb-bg": "{colors.neutral.subtle.bg.active}",
          },
        },
      },
      visible: {
        content: {
          "&[data-overflow-y]": {
            pe: "var(--scrollbar-size)",
          },
          "&[data-overflow-x]": {
            pb: "var(--scrollbar-size)",
          },
        },
        scrollbar: {
          bg: "neutral.subtle.bg",
          borderRadius: "full",
        },
        thumb: {
          "--thumb-bg": "{colors.neutral.subtle.bg.active}",
        },
      },
    },
    size: {
      xs: { root: { "--thumb-size": visual("0.25rem") } },
      sm: { root: { "--thumb-size": visual("0.375rem") } },
      md: { root: { "--thumb-size": visual("0.5rem") } },
      lg: { root: { "--thumb-size": visual("0.625rem") } },
    },
  },
});
