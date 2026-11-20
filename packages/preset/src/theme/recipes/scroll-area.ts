import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { visual } from "./control-size";

const lengthVar = { syntax: "<length>", inherits: false, initialValue: "0px" } as const;

// Set from JS on the part that reads each, on every scroll; inheriting would restyle every row inside.
export const scrollAreaGlobalVars: GlobalVarsDefinition = {
  "--scroll-area-overflow-x-start": lengthVar,
  "--scroll-area-overflow-x-end": lengthVar,
  "--scroll-area-overflow-y-start": lengthVar,
  "--scroll-area-overflow-y-end": lengthVar,
  "--scroll-area-thumb-width": lengthVar,
  "--scroll-area-thumb-height": lengthVar,
  "--scroll-area-thumb-offset": lengthVar,
  "--scroll-area-corner-width": lengthVar,
  "--scroll-area-corner-height": lengthVar,
};

const shown = { opacity: "1" };
const unshown = { opacity: "0" };

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
      isolation: "isolate",
      overflow: "hidden",
      "--scrollbar-margin": "0px",
      "--scrollbar-size": "calc(var(--thumb-size) + calc(var(--scrollbar-margin) * 2))",
    },
    viewport: {
      display: "flex",
      flexDirection: "column",
      height: "full",
      width: "full",
      overflow: "auto",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      // Panda drops an @property registration the stylesheet never writes; the viewport writes these from JS.
      "--scroll-area-overflow-x-start": "0px",
      "--scroll-area-overflow-x-end": "0px",
      "--scroll-area-overflow-y-start": "0px",
      "--scroll-area-overflow-y-end": "0px",
      _scrollbar: {
        display: "none",
      },
      _overflowX: {
        "& *": {
          _pinned: {
            _after: {
              content: '""',
              position: "absolute",
              pointerEvents: "none",
              top: "0",
              bottom: "-1px",
              width: "32px",
            },
          },
          _pinnedLeft: {
            _after: {
              insetInlineEnd: "0",
              translate: "100% 0",
              boxShadow: "inset",
            },
          },
        },
        _atLeft: {
          "& *": {
            _pinnedLeft: {
              _after: {
                insetInlineEnd: "auto",
                translate: "none",
                boxShadow: "none",
              },
            },
          },
        },
      },
    },
    scrollbar: {
      alignItems: "center",
      display: "flex",
      position: "absolute",
      touchAction: "none",
      userSelect: "none",
      zIndex: "overlay",
      _vertical: {
        flexDirection: "column",
        width: "var(--scrollbar-size)",
        py: "var(--scrollbar-margin)",
        top: "0",
        bottom: "var(--scroll-area-corner-height)",
        insetInlineEnd: "0",
      },
      _horizontal: {
        flexDirection: "row",
        height: "var(--scrollbar-size)",
        px: "var(--scrollbar-margin)",
        insetInlineStart: "0",
        insetInlineEnd: "var(--scroll-area-corner-width)",
        bottom: "0",
      },
      _hidden: {
        display: "none",
      },
    },
    thumb: {
      borderRadius: "full",
      bg: "var(--thumb-bg)",
      transitionDuration: "normal",
      transitionProperty: "background, color, box-shadow",
      transitionTimingFunction: "default",
      _vertical: {
        width: "var(--thumb-size)",
        height: "var(--scroll-area-thumb-height)",
        transform: "translate3d(0, var(--scroll-area-thumb-offset), 0)",
      },
      _horizontal: {
        height: "var(--thumb-size)",
        width: "var(--scroll-area-thumb-width)",
        transform: "translate3d(var(--scroll-area-thumb-offset), 0, 0)",
      },
    },
    content: {
      minW: "fit-content",
    },
    corner: {
      position: "absolute",
      bottom: "0",
      insetInlineEnd: "0",
      width: "var(--scroll-area-corner-width)",
      height: "var(--scroll-area-corner-height)",
      _hidden: {
        display: "none",
      },
    },
  },
  defaultVariants: {
    size: "md",
    scrollbar: "auto",
    scrollbars: "both",
    fadeEdges: false,
  },
  variants: {
    fadeEdges: {
      true: {
        root: {
          "--scroll-area-fade-color": "{colors.bg}",
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
            ...unshown,
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
            ...unshown,
            transitionDuration: "normal",
            transitionProperty: "opacity",
            transitionTimingFunction: "default",
            zIndex: "docked",
          },
          _overflowY: {
            _before: shown,
            _after: shown,
            _atTop: { _before: unshown },
            _atBottom: { _after: unshown },
          },
        },
      },
      false: {},
    },
    scrollbar: {
      auto: {
        scrollbar: {
          _scrolling: { "--thumb-bg": "{colors.neutral.subtle.bg.active}" },
          _hover: { "--thumb-bg": "{colors.neutral.subtle.bg.active}" },
        },
      },
      thumb: {
        scrollbar: {
          "--thumb-bg": "{colors.neutral.subtle.bg.active}",
          _scrolling: { "--thumb-bg": "{colors.border.control}" },
          _hover: { "--thumb-bg": "{colors.border.control}" },
        },
      },
      visible: {
        content: {
          _overflowY: {
            pe: "var(--scrollbar-size)",
          },
          _overflowX: {
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
    scrollbars: {
      vertical: {
        viewport: {
          overflowX: "hidden",
        },
        content: {
          minW: "full",
          w: "full",
        },
      },
      horizontal: {},
      both: {},
    },
    size: {
      xs: { root: { "--thumb-size": visual("0.25rem") } },
      sm: { root: { "--thumb-size": visual("0.375rem") } },
      md: { root: { "--thumb-size": visual("0.5rem") } },
      lg: { root: { "--thumb-size": visual("0.625rem") } },
    },
  },
});
