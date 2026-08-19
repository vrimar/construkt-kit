/** Canonical colorPalette variant bodies. Recipes spread these, top-level or into a slot. */
export const paletteVariant = {
  solid: {
    bg: "colorPalette.solid.bg",
    color: "colorPalette.solid.fg",
  },
  surface: {
    bg: "colorPalette.surface.bg",
    borderWidth: "1px",
    borderColor: "colorPalette.surface.border",
    color: "colorPalette.surface.fg",
  },
  subtle: {
    bg: "colorPalette.subtle.bg",
    color: "colorPalette.subtle.fg",
  },
  outline: {
    borderWidth: "1px",
    borderColor: "colorPalette.outline.border",
    color: "colorPalette.outline.fg",
  },
  plain: {
    color: "colorPalette.plain.fg",
  },
} as const;
