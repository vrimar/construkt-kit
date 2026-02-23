import { defineSlotRecipe } from "@chakra-ui/react";
import { toastSlotRecipe } from "@chakra-ui/react/theme";

export const toastRecipe = defineSlotRecipe({
  ...toastSlotRecipe,
  base: {
    root: {
      "&[data-type=success]": {
        bg: "bg.panel",
        borderWidth: "1px",
        borderColor: "green.solid",
        color: "fg.success",
        "--toast-trigger-bg": "{white/10}",
        "--toast-border-color": "{white/40}",
      },

      "&[data-type=error]": {
        bg: "bg.panel",
        borderWidth: "1px",
        borderColor: "red.solid",
        color: "fg.error",
        "--toast-trigger-bg": "{white/10}",
        "--toast-border-color": "{white/40}",
      },
    },
  },
});
