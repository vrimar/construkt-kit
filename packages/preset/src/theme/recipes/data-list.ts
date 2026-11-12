import { defineSlotRecipe } from "@pandacss/dev";

export const dataList = defineSlotRecipe({
  className: "data-list",
  slots: ["root", "item", "itemLabel", "itemValue"],
  base: {
    root: {
      display: "grid",
      alignContent: "start",
      rowGap: "var(--data-list-gap)",
      columnGap: "var(--data-list-column-gap)",
    },
    item: {
      display: "grid",
      rowGap: "var(--data-list-item-gap)",
    },
    itemLabel: {
      display: "flex",
      alignItems: "center",
      gap: "1",
      color: "fg.muted",
    },
    itemValue: {
      minWidth: "0",
      overflowWrap: "anywhere",
      color: "fg",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    size: "md",
  },
  variants: {
    orientation: {
      horizontal: {
        root: { gridTemplateColumns: "auto minmax(0, 1fr)" },
        item: {
          gridColumn: "1 / -1",
          gridTemplateColumns: "subgrid",
          alignItems: "baseline",
        },
        itemLabel: { gridColumn: "1" },
        itemValue: { gridColumn: "2" },
      },
      vertical: {},
    },
    size: {
      sm: {
        root: {
          "--data-list-gap": "{spacing.2}",
          "--data-list-column-gap": "{spacing.3}",
          "--data-list-item-gap": "{spacing.0.5}",
          textStyle: "xs",
        },
      },
      md: {
        root: {
          "--data-list-gap": "{spacing.3}",
          "--data-list-column-gap": "{spacing.4}",
          "--data-list-item-gap": "{spacing.1}",
          textStyle: "sm",
        },
      },
      lg: {
        root: {
          "--data-list-gap": "{spacing.4}",
          "--data-list-column-gap": "{spacing.6}",
          "--data-list-item-gap": "{spacing.1.5}",
          textStyle: "md",
        },
      },
    },
  },
});
