import { defineSlotRecipe } from "@pandacss/dev";

export const emptyState = defineSlotRecipe({
  className: "empty-state",
  slots: ["root", "content", "indicator", "title", "description"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "3",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1",
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
        root: { py: "8", px: "4" },
        indicator: { _icon: { width: "6", height: "6" } },
        title: { textStyle: "md" },
        description: { textStyle: "xs" },
      },
      md: {
        root: { py: "12", px: "6" },
        indicator: { _icon: { width: "8", height: "8" } },
        title: { textStyle: "lg" },
        description: { textStyle: "sm" },
      },
      lg: {
        root: { py: "16", px: "8" },
        indicator: { _icon: { width: "10", height: "10" } },
        title: { textStyle: "xl" },
        description: { textStyle: "md" },
      },
    },
  },
});
