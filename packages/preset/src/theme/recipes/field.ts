import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { surface } from "./control-size";

/** The label column's width in a horizontal field, which an app sets on the field or above it. */
export const fieldGlobalVars: GlobalVarsDefinition = {
  "--field-label-width": { syntax: "*", inherits: true },
};

const labelColumn = "var(--field-label-width, {sizes.44})";

export const fieldLabel = {
  textStyle: "label",
  userSelect: "none",
} as const;

export const field = defineSlotRecipe({
  className: "field",
  slots: ["root", "errorText", "helperText", "label", "requiredIndicator", "labelAction"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: surface("0.375rem"),
      "&:has(> [data-slot=labelAction])": {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        columnGap: "3",
        alignItems: "baseline",
        "& > *": { gridColumn: "1 / -1" },
        "& > [data-slot=label]": { gridColumn: "1", gridRow: "1" },
        "& > [data-slot=labelAction]": { gridColumn: "2", gridRow: "1" },
      },
    },
    label: {
      ...fieldLabel,
      alignItems: "center",
      display: "flex",
      gap: surface("0.125rem"),
      textAlign: "start",
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
            "& > [data-slot=label]": { gridColumn: "1", gridRow: "1" },
            "&:has(> [data-slot=labelAction])": {
              gridTemplateColumns: `${labelColumn} minmax(0, 1fr) auto`,
            },
            "& > [data-slot=labelAction]": { gridColumn: "3", gridRow: "1" },
          },
        },
      },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});
