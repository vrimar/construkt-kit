import { defineSlotRecipe } from "@pandacss/dev";

export const breadcrumb = defineSlotRecipe({
  className: "breadcrumb",
  slots: ["root", "list", "link", "item", "separator", "ellipsis"],
  base: {
    list: {
      alignItems: "center",
      display: "flex",
      listStyle: "none",
      wordBreak: "break-word",
    },
    link: {
      alignItems: "center",
      borderRadius: "sm",
      display: "inline-flex",
      focusVisibleRing: "outside",
      gap: "2",
      outline: "0",
      textDecoration: "none",
      transition: "color",
      _icon: { boxSize: "1em" },
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
      color: "fg.muted",
      _last: {
        color: "fg",
      },
    },
    separator: {
      color: "fg.subtle",
      _icon: { boxSize: "1em" },
      _rtl: { rotate: "180deg" },
    },
    ellipsis: {
      alignItems: "center",
      color: "fg.muted",
      display: "inline-flex",
      justifyContent: "center",
      _icon: { boxSize: "1em" },
    },
  },

  defaultVariants: {
    variant: "plain",
    size: "md",
  },

  variants: {
    variant: {
      underline: {
        link: {
          textDecoration: "underline",
          textDecorationThickness: "0.1em",
          textUnderlineOffset: "0.125em",
          textDecorationColor: "fg.subtle",
          _hover: { textDecorationColor: "fg" },
        },
      },
      plain: {
        link: {
          color: "fg.muted",
          _hover: { color: "fg" },
          _currentPage: { color: "fg" },
        },
      },
    },
    size: {
      xs: { list: { gap: "1", textStyle: "xs" } },
      sm: { list: { gap: "1", textStyle: "sm" } },
      md: { list: { gap: "1.5", textStyle: "md" } },
      lg: { list: { gap: "2", textStyle: "lg" } },
    },
  },
});
