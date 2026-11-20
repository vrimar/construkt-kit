import { defineLayerStyles } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

/** The background a surface paints, for content that covers part of it to match. */
export const surfaceGlobalVars: GlobalVarsDefinition = {
  "--surface-bg": { syntax: "*", inherits: true },
};

const floatingSurface = {
  "--surface-bg": "colors.neutral.surface.bg",
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
  hatched: {
    value: {
      color: "fg.muted",
      backgroundImage:
        "repeating-linear-gradient(135deg, {colors.bg.subtle} 0 0.375rem, {colors.bg.muted} 0.375rem 0.75rem)",
    },
  },
});
