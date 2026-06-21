import { fileUploadAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlGap, controlIcon, controlPx, controlText, surface } from "./control-size";

export const fileUpload = defineSlotRecipe({
  className: "file-upload",
  slots: fileUploadAnatomy.keys(),
  base: {
    root: {
      alignItems: "flex-start",
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    label: {
      textStyle: "label",
    },
    dropzone: {
      alignItems: "center",
      background: "neutral.surface.bg",
      borderRadius: "lg",
      borderStyle: "dashed",
      borderWidth: "2px",
      display: "flex",
      flexDirection: "column",

      focusVisibleRing: "outside",
      justifyContent: "center",
      transition: "colors",
      width: "full",
      _dragging: {
        background: "neutral.surface.bg.hover",
        borderStyle: "solid",
        borderColor: "colorPalette.solid.bg",
      },
    },
    item: {
      alignItems: "start",
      animationDuration: "normal",
      animationName: "fade-in",
      background: "neutral.surface.bg",
      borderRadius: "lg",
      borderWidth: "1px",
      display: "flex",
      pos: "relative",
      width: "full",
    },
    itemGroup: {
      display: "flex",
      alignItems: "start",
      flexDirection: "column",
      width: "full",
    },
    itemName: {
      color: "fg",
      fontWeight: "medium",
    },
    itemSizeText: {
      color: "fg.muted",
    },
    itemDeleteTrigger: {
      color: "fg.subtle",
    },
    itemPreviewImage: {
      aspectRatio: "1",
      objectFit: "cover",
      maxW: "20",
      borderRadius: "md",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      md: {
        root: { gap: "4" },
        dropzone: {
          px: surface("1.5rem"),
          py: surface("1rem"),
          minHeight: surface("20rem"),
          gap: "0",
        },
        item: { p: controlPx("xl"), gap: controlGap("2xl"), ...controlText("sm") },
        itemGroup: { gap: controlGap("2xl") },
        itemDeleteTrigger: { _icon: { boxSize: controlIcon("md") } },
      },
    },
  },
});
