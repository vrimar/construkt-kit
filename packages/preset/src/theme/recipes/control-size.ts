// Single source of truth for control sizing.
//
// Every axis is emitted INLINE on the real property (height, padding, font-size, gap, icon
// box, …) via these helpers, NOT through a :root semantic token. A :root token defined as
// `calc(var(--knob) …)` is computed once against :root and frozen on inherit, so a scoped
// `--knob` override would be ignored. Inline on a real property resolves at the control
// element, which inherits the override — so a handful of knobs on any scope rescale the
// whole control surface.
//
// The control family keeps a base+per-size-offset model (grid-aligned, md-centred); offsets
// reproduce today's ladders exactly, so defaults are a no-op until a knob is overridden.

export type ControlSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const BASE_H = "var(--control-base-h, 2.25rem)";
const STEP = "var(--control-step, 0.25rem)";
const BASE_PX = "var(--control-base-px, 0.75rem)";
const BASE_GAP = "var(--control-base-gap, 0.5rem)";
const BASE_ICON = "var(--control-base-icon, 1rem)";
const BASE_BOX = "var(--control-base-box, 1.125rem)";
const BASE_FONT = "var(--control-base-font, 0.875rem)";

/** Add a per-size rem offset to a knob var; `0` returns the bare var (no redundant calc). */
const off = (v: string, rem: number): string =>
  rem === 0 ? v : `calc(${v} ${rem < 0 ? "-" : "+"} ${Math.abs(rem)}rem)`;

// md is the base (offset 0). Each table reproduces today's per-size token ladder exactly.
const H_STEP: Record<ControlSize, number> = {
  "2xs": -3,
  xs: -2,
  sm: -1,
  md: 0,
  lg: 1,
  xl: 2,
  "2xl": 5,
};
const PX: Record<ControlSize, number> = {
  "2xs": -0.375,
  xs: -0.25,
  sm: -0.125,
  md: 0,
  lg: 0.125,
  xl: 0.25,
  "2xl": 0.5,
};
const GAP: Record<ControlSize, number> = {
  "2xs": -0.25,
  xs: -0.125,
  sm: -0.125,
  md: 0,
  lg: 0,
  xl: 0.125,
  "2xl": 0.25,
};
const ICON: Record<ControlSize, number> = {
  "2xs": -0.125,
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0.25,
  xl: 0.25,
  "2xl": 0.5,
};
const BOX: Record<ControlSize, number> = {
  "2xs": -0.25,
  xs: -0.125,
  sm: -0.125,
  md: 0,
  lg: 0.125,
  xl: 0.25,
  "2xl": 0.375,
};
const FONT: Record<ControlSize, number> = {
  "2xs": -0.125,
  xs: -0.125,
  sm: 0,
  md: 0,
  lg: 0.125,
  xl: 0.125,
  "2xl": 0.25,
};
// Line-height as an offset from the font knob, so text leading scales with --control-base-font
// while still reproducing today's per-size line-heights exactly.
const LH: Record<ControlSize, number> = {
  "2xs": 0.125,
  xs: 0.25,
  sm: 0.375,
  md: 0.375,
  lg: 0.625,
  xl: 0.625,
  "2xl": 0.875,
};

/** Inline height for the `md`-centred control ladder, driven by the --control-base-h knob. */
export const controlH = (size: ControlSize): string => {
  const n = H_STEP[size];
  if (n === 0) return BASE_H;
  return `calc(${BASE_H} ${n < 0 ? "-" : "+"} ${Math.abs(n)} * ${STEP})`;
};

/** Inline horizontal padding, driven by --control-base-px. */
export const controlPx = (size: ControlSize): string => off(BASE_PX, PX[size]);

/** Inline gap / vertical padding, driven by --control-base-gap. */
export const controlGap = (size: ControlSize): string => off(BASE_GAP, GAP[size]);

/** Inline icon box size, driven by --control-base-icon. */
export const controlIcon = (size: ControlSize): string => off(BASE_ICON, ICON[size]);

/** Inline checkbox/radio box size, driven by --control-base-box. */
export const controlBox = (size: ControlSize): string => off(BASE_BOX, BOX[size]);

/** Inline font-size, driven by --control-base-font. */
export const controlFont = (size: ControlSize): string => off(BASE_FONT, FONT[size]);

/** Recentred control text: paired font-size + line-height, both driven by --control-base-font. */
export const controlText = (size: ControlSize) => ({
  fontSize: controlFont(size),
  lineHeight: off(BASE_FONT, LH[size]),
});

/** Container/overlay padding — proportional multiplier knob. Pass a rem literal (e.g. "1rem"). */
export const surface = (rem: string): string => `calc(${rem} * var(--surface-scale, 1))`;

/** Graphical element size — proportional multiplier knob. Pass a rem literal (e.g. "1.25rem"). */
export const visual = (rem: string): string => `calc(${rem} * var(--visual-scale, 1))`;
