import { defineLayerStyles } from "@pandacss/dev";

export const layerStyles = defineLayerStyles({
  disabled: {
    value: {
      cursor: "not-allowed",
      opacity: "0.67",
      filter: "grayscale(100%)",
    },
  },
  "dropdown.surface": {
    value: {
      background: "neutral.surface.bg",
      borderWidth: "1px",
      borderColor: "neutral.surface.border",
      borderRadius: "md",
      boxShadow: "md",
    },
  },
  "floating.surface": {
    value: {
      background: "neutral.surface.bg",
      borderWidth: "1px",
      borderColor: "neutral.surface.border",
      borderRadius: "lg",
      boxShadow: "md",
    },
  },
  "modal.surface": {
    value: {
      background: "neutral.surface.bg",
      borderWidth: "1px",
      borderColor: "neutral.surface.border",
      boxShadow: "lg",
    },
  },
});
