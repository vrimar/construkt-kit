import { type ControlSize, controlH, controlPx, controlIcon, controlText } from "./control-size";

const itemTier = (size: ControlSize) => ({
  item: {
    h: controlH(size),
    minW: controlH(size),
    ...controlText(size),
    px: controlPx(size),
    _icon: { boxSize: controlIcon(size) },
  },
});

export const segmentedRoot = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  isolation: "isolate",
  position: "relative",
  maxWidth: "100%",
  overflowX: "auto",
  scrollbar: "hidden",
  _vertical: {
    flexDirection: "column",
    alignItems: "stretch",
  },
} as const;

export const segmentedSizes = {
  xs: itemTier("xs"),
  sm: itemTier("sm"),
  md: itemTier("md"),
  lg: itemTier("lg"),
  xl: itemTier("xl"),
};

export const fittedVariant = {
  true: {
    root: { display: "flex" },
    item: { flex: "1" },
  },
};

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

const hiddenDivider = { _before: { opacity: "0" } };

// A pressed item's fill comes in as `thumb`: a `_pressed` key spread after this would drop its divider rule.
export const enclosedItem = (dividerEdge: string, thumb: Record<string, unknown> = {}) => ({
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
  "&:first-of-type": hiddenDivider,
  _checked: hiddenDivider,
  _afterChecked: hiddenDivider,
  _pressed: { ...thumb, ...hiddenDivider },
  _afterPressed: hiddenDivider,
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
