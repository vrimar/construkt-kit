import { defineSlotRecipe } from "@pandacss/dev";

import { controlH } from "./control-size";
import { pickerParts } from "./floating";

export const datePicker = defineSlotRecipe({
  className: "date-picker",
  slots: [
    "clearTrigger",
    "content",
    "control",
    "nextTrigger",
    "positioner",
    "presetTrigger",
    "prevTrigger",
    "root",
    "table",
    "tableBody",
    "tableCell",
    "tableCellTrigger",
    "tableHead",
    "tableHeader",
    "tableRow",
    "trigger",
    "view",
    "viewControl",
    "viewTrigger",
  ],
  base: {
    ...pickerParts,
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
      // Cells touch, so a hit area wider than the cell would take taps meant for its neighbour.
      _pointerCoarse: { _after: { display: "none" } },
      _today: {
        _before: {
          content: "'−'",
          color: "colorPalette.fg",
          position: "absolute",
          marginTop: "6",
        },
      },
      _inRange: {
        background: "neutral.subtle.bg",
      },
      _selected: {
        background: "colorPalette.subtle.bg",
        _before: {
          color: "colorPalette.subtle.fg",
        },
      },
    },
    view: {
      display: "flex",
      flexDirection: "column",
      gap: "3",
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
        },
      },
    },
  },
  defaultVariants: {
    variant: "popover",
  },
});
