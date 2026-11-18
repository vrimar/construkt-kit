import { type ControlSize, controlH, controlPx, controlIcon, controlText } from "./control-size";

export const itemTier = (size: ControlSize) => ({
  item: {
    h: controlH(size),
    minW: controlH(size),
    ...controlText(size),
    px: controlPx(size),
    _icon: { boxSize: controlIcon(size) },
  },
});

export const enclosedTrack = {
  bg: "neutral.subtle.bg",
  borderRadius: "lg",
  // Painted over the indicator, whose integer-rounded rect can overshoot the scroll clip.
  outline: "1px solid",
  outlineColor: "border",
  outlineOffset: "-1px",
};

export const enclosedThumb = {
  bg: "bg.control",
  borderColor: "neutral.surface.border",
};

export const enclosedItem = (dividerEdge: string) => ({
  // The track scrolls, so it clips a ring drawn outside the item.
  focusRingOffset: "-2px",
  _before: {
    content: '""',
    position: "absolute",
    bg: "neutral.surface.border",
    transition: "opacity 0.2s",
  },
  _horizontal: {
    _before: {
      insetInlineStart: dividerEdge,
      insetBlock: "1.5",
      width: "1px",
    },
  },
  _vertical: {
    _before: {
      insetBlockStart: dividerEdge,
      insetInline: "1.5",
      height: "1px",
    },
  },
  "& + &:is([data-state=checked], [data-state=on]), &:is([data-state=checked], [data-state=on]) + &, &:first-of-type":
    {
      _before: {
        opacity: "0",
      },
    },
});

export const outlineTrack = {
  borderRadius: "lg",
  borderWidth: "1px",
  borderColor: "neutral.surface.border",
  gap: "1",
  p: "1",
};

export const outlineThumb = {
  bg: "colorPalette.outline.bg.active",
  borderColor: "colorPalette.outline.border",
};
