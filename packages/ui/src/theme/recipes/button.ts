import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      outline: {
        bg: "bg",
        borderColor: "border",
        color: "fg",
        _hover: {
          bg: "bg.subtle",
        },
        _expanded: {
          bg: "bg.subtle",
        },
      },
      surface: {
        bg: "bg.subtle",
        borderColor: "border",
        color: "fg",
        _hover: {
          bg: "bg.muted",
        },
        _expanded: {
          bg: "bg.muted",
        },
        boxShadow: "none",
      },
      ghost: {
        color: "fg",
        _hover: {
          bg: "bg.subtle",
        },
        _expanded: {
          bg: "bg.subtle",
        },
      },
      "ghost-outline": {
        color: "fg",
        borderColor: "border",
        _hover: {
          bg: "bg.subtle",
          borderColor: "border",
        },
        _expanded: {
          bg: "bg.subtle",
          borderColor: "border",
        },
      },
    },
  },
});
