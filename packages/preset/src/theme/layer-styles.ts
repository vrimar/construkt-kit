import { defineLayerStyles } from "@pandacss/dev";

const floatingSurface = {
  background: "neutral.surface.bg",
  borderWidth: "1px",
  borderColor: "neutral.surface.border",
} as const;

export const layerStyles = defineLayerStyles({
  disabled: {
    value: {
      cursor: "not-allowed",
      opacity: "0.67",
      filter: "grayscale(100%)",
    },
  },
  "dropdown.surface": {
    value: { ...floatingSurface, borderRadius: "md", boxShadow: "md" },
  },
  "floating.surface": {
    value: { ...floatingSurface, borderRadius: "lg", boxShadow: "md" },
  },
  "modal.surface": {
    value: { ...floatingSurface, boxShadow: "lg" },
  },
});
