import { splitterAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const splitter = defineSlotRecipe({
  className: "splitter",
  slots: splitterAnatomy.keys(),
  base: {
    root: {
      display: "flex",
    },
    panel: {
      display: "flex",
      background: "colorPalette.surface.bg",
    },
    resizeTrigger: {
      borderRadius: "lg",
      transition: "common",
      outline: "0",
      background: "neutral.subtle.bg",
      // aria-orientation is the bar's own: a horizontal group has vertical separators.
      "&[aria-orientation=vertical]": {
        minWidth: "1.5",
      },
      "&[aria-orientation=horizontal]": {
        minHeight: "1.5",
      },
    },
  },
  defaultVariants: {
    variant: "bar",
  },
  variants: {
    variant: {
      bar: {
        resizeTrigger: { focusVisibleRing: "outside" },
      },
      gutter: {
        resizeTrigger: {
          position: "relative",
          borderRadius: "0",
          background: "transparent",
          _after: {
            content: '""',
            position: "absolute",
            borderRadius: "full",
            transition: "common",
          },
          "&[aria-orientation=vertical]": {
            minWidth: "2.5",
            _after: { insetBlock: "0", left: "50%", width: "0.5", translate: "-50% 0" },
          },
          "&[aria-orientation=horizontal]": {
            minHeight: "2.5",
            _after: { insetInline: "0", top: "50%", height: "0.5", translate: "0 -50%" },
          },
          "&:is([data-separator=hover], [data-separator=active], :not([data-separator=disabled]):hover, :focus-visible)":
            {
              _after: { background: "colorPalette.solid.bg" },
            },
        },
      },
    },
  },
});
