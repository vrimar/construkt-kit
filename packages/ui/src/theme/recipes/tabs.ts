import { defineSlotRecipe } from "@chakra-ui/react";

export const tabsRecipe = defineSlotRecipe({
  slots: [],
  variants: {
    size: {
      xs: {
        root: {
          "--tabs-height": "sizes.8",
          "--tabs-content-padding": "spacing.3",
        },
        trigger: {
          py: "0.5",
          px: "3",
          textStyle: "sm",
        },
      },
    },
    variant: {
      enclosed: {
        trigger: {
          borderWidth: "1px",
          borderColor: "transparent",
          _selected: {
            color: "fg",
            borderColor: "border",
          },
          _hover: {
            color: "primary",
          },
        },
      },
    },
  },
});
