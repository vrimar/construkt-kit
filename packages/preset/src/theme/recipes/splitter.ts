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
      _horizontal: {
        minWidth: "1.5",
      },
      _vertical: {
        minHeight: "1.5",
      },
    },
  },
});
