import { defineSlotRecipe } from "@pandacss/dev";

import { surface } from "./control-size";

export const emptyState = defineSlotRecipe({
  className: "empty-state",
  slots: ["root", "content", "indicator", "title", "description"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: surface("0.75rem"),
    },
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: surface("0.25rem"),
    },
    indicator: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "fg.muted",
    },
    title: {
      fontWeight: "semibold",
      color: "fg",
    },
    description: {
      color: "fg.muted",
      textAlign: "center",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: {
        root: { py: surface("2rem"), px: surface("1rem") },
        indicator: { _icon: { width: "6", height: "6" } },
        title: { textStyle: "md" },
        description: { textStyle: "xs" },
      },
      md: {
        root: { py: surface("3rem"), px: surface("1.5rem") },
        indicator: { _icon: { width: "8", height: "8" } },
        title: { textStyle: "lg" },
        description: { textStyle: "sm" },
      },
      lg: {
        root: { py: surface("4rem"), px: surface("2rem") },
        indicator: { _icon: { width: "10", height: "10" } },
        title: { textStyle: "xl" },
        description: { textStyle: "md" },
      },
    },
  },
});
