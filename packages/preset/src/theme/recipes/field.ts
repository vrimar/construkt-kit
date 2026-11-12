import { fieldAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

const labelColumn = "var(--field-label-width, {sizes.44})";

export const field = defineSlotRecipe({
  className: "field",
  slots: [...fieldAnatomy.keys(), "labelAction"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: surface("0.375rem"),
      "&:has(> [data-part=label-action])": {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        columnGap: "3",
        alignItems: "baseline",
        "& > *": { gridColumn: "1 / -1" },
        "& > [data-part=label]": { gridColumn: "1", gridRow: "1" },
        "& > [data-part=label-action]": { gridColumn: "2", gridRow: "1" },
      },
    },
    label: {
      alignItems: "center",
      display: "flex",
      gap: surface("0.125rem"),
      textAlign: "start",
      userSelect: "none",
      textStyle: "label",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    requiredIndicator: {
      color: "fg.error",
    },
    labelAction: {
      display: "flex",
      textStyle: "sm",
    },
    helperText: {
      color: "fg.muted",
      textStyle: "sm",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    errorText: {
      color: "fg.error",
      textStyle: "sm",
    },
  },
  variants: {
    orientation: {
      vertical: {},
      horizontal: {
        root: {
          md: {
            display: "grid",
            gridTemplateColumns: `${labelColumn} minmax(0, 1fr)`,
            columnGap: surface("0.75rem"),
            alignItems: "center",
            "& > *": { gridColumn: "2" },
            "& > [data-part=label]": { gridColumn: "1", gridRow: "1" },
            "&:has(> [data-part=label-action])": {
              gridTemplateColumns: `${labelColumn} minmax(0, 1fr) auto`,
            },
            "& > [data-part=label-action]": { gridColumn: "3", gridRow: "1" },
          },
        },
      },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});
