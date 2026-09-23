import { datePickerAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH } from "./control-size";

export const datePicker = defineSlotRecipe({
  className: "date-picker",
  slots: datePickerAnatomy.keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
    },
    content: {
      layerStyle: "floating.surface",
      display: "flex",
      flexDirection: "column",
      gap: "3",
      p: "4",
      zIndex: "dropdown",
      _hidden: {
        display: "none",
      },
    },
    control: {
      display: "flex",
      flexDirection: "row",
      gap: "2",
    },
    label: {
      color: "fg",
      fontWeight: "medium",
      textStyle: "sm",
    },
    tableHeader: {
      color: "fg.muted",
      fontWeight: "semibold",
      height: controlH("md"),
      textStyle: "sm",
    },
    viewControl: {
      display: "flex",
      gap: "2",
      justifyContent: "space-between",
    },
    table: {
      width: "full",
      borderCollapse: "separate",
      borderSpacing: "1",
      m: "-1",
    },
    tableCell: {
      textAlign: "center",
    },
    tableCellTrigger: {
      width: "100%",
      _today: {
        _before: {
          content: "'−'",
          color: "colorPalette.solid.fg",
          position: "absolute",
          marginTop: "6",
        },
      },
      "&[data-in-range]": {
        background: "neutral.subtle.bg",
      },
      _selected: {
        _before: {
          color: "colorPalette.solid.fg",
        },
      },
    },
    view: {
      display: "flex",
      flexDirection: "column",
      gap: "3",
      _hidden: {
        display: "none",
      },
    },
  },
  variants: {
    variant: {
      popover: {},
      inline: {
        content: {
          boxShadow: "none",
          p: "0",
          width: "full",
          zIndex: "auto",
        },
      },
    },
  },
  defaultVariants: {
    variant: "popover",
  },
});
