const invalidOutline = {
  outline: "2px solid",
  outlineColor: "border.error",
  outlineOffset: "2px",
} as const;

export const choiceControlBase = {
  display: "inline-flex",
  flexShrink: "0",
  focusVisibleRing: "outside",
  // The focus ring draws where the outline would, so a focused control shows the ring.
  _invalid: { "&:not(:focus-visible, [data-focus-visible])": invalidOutline },
} as const;

export const solidCheckedFill = {
  bg: "colorPalette.solid.bg",
  borderColor: "colorPalette.solid.bg",
  color: "colorPalette.solid.fg",
} as const;
