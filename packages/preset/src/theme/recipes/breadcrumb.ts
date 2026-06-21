import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlText } from "./control-size";

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
      gap: controlGap("md"),
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
      xs: { list: { gap: controlGap("2xs"), ...controlText("xs") } },
      sm: { list: { gap: controlGap("2xs"), ...controlText("sm") } },
      md: { list: { gap: controlGap("xs"), ...controlText("lg") } },
      lg: { list: { gap: controlGap("md"), ...controlText("2xl") } },
    },
  },
});
