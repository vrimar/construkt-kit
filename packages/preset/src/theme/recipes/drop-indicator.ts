export const dropIndicator = {
  colorPalette: "blue",
  position: "absolute",
  pointerEvents: "none",
  zIndex: "1",
} as const;

export const dropLine = {
  bg: "colorPalette.solid.bg",
  borderRadius: "full",
} as const;

export const dropOnto = {
  borderWidth: "2px",
  borderColor: "colorPalette.solid.bg",
} as const;
