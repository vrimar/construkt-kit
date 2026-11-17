import { contrast, hexToOklch, luminance, maxChroma, oklchToHex } from "./oklch";

export type Theme = "light" | "dark";
export const THEMES: readonly Theme[] = ["light", "dark"];

/** A palette's source colour and the few hand-set numbers that shape its ramp. */
export interface PaletteKey {
  /** The brand or hue colour as `#rrggbb`. Light solids use it verbatim when it passes contrast. */
  key: string;
  /** Hue drift in degrees toward the light end (`tint`) and the dark end (`shade`) of the ramp. */
  hueShift?: { tint?: number; shade?: number };
  /** Multiplier on tint chroma, below 1 to calm hues that read neon when pale. */
  tints?: number;
  /** Label colour on the solid fill. Defaults to white when the key reaches 3:1 on white, else near-black. */
  onSolid?: "white" | "ink";
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const STEPS: readonly Step[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SCALE: Record<Step, { ratio: Record<Theme, number>; chroma: Record<Theme, number> }> = {
  1: { ratio: { light: 1.04, dark: 1.05 }, chroma: { light: 0.9, dark: 0.3 } },
  2: { ratio: { light: 1.07, dark: 1.1 }, chroma: { light: 0.9, dark: 0.35 } },
  3: { ratio: { light: 1.1, dark: 1.18 }, chroma: { light: 0.9, dark: 0.4 } },
  4: { ratio: { light: 1.16, dark: 1.28 }, chroma: { light: 0.9, dark: 0.45 } },
  5: { ratio: { light: 1.23, dark: 1.4 }, chroma: { light: 0.9, dark: 0.5 } },
  6: { ratio: { light: 1.3, dark: 1.6 }, chroma: { light: 0.9, dark: 0.6 } },
  7: { ratio: { light: 1.7, dark: 2 }, chroma: { light: 0.9, dark: 0.7 } },
  8: { ratio: { light: 3.4, dark: 3.6 }, chroma: { light: 0.95, dark: 0.9 } },
  9: { ratio: { light: 6.5, dark: 6.5 }, chroma: { light: 0.9, dark: 0.85 } },
  10: { ratio: { light: 12, dark: 12 }, chroma: { light: 0.75, dark: 0.6 } },
};
const LAST_TINT_STEP = 7;

type TextRole = "DEFAULT" | "muted" | "subtle";

const TEXT: Record<Theme, Record<TextRole, number>> = {
  light: { DEFAULT: 13, muted: 8.5, subtle: 5 },
  dark: { DEFAULT: 15.5, muted: 8.5, subtle: 5.8 },
};
const TEXT_CHROMA: Record<Theme, number> = { light: 0.9, dark: 0.3 };

const SOLID = {
  hoverFactor: 1.2,
  minNonText: 3.05,
  minText: 4.55,
  inkY: 0.003,
  track: 3 as Step,
};

const CANVAS: Record<Theme, { l: number; chroma: number }> = {
  light: { l: 1, chroma: 0 },
  dark: { l: 0.18, chroma: 0.12 },
};

interface HuePath {
  l: number;
  c: number;
  h: number;
  saturation: number;
  tints: number;
  hueAt(L: number): number;
}

interface Floor {
  ok(hex: string): boolean;
  dir: number | ((hex: string) => number);
}

function huePath(key: PaletteKey): HuePath {
  const [l, c, h] = hexToOklch(key.key);
  const tint = key.hueShift?.tint ?? 0;
  const shade = key.hueShift?.shade ?? 0;
  return {
    l,
    c,
    h,
    saturation: Math.min(1, c / Math.max(1e-6, maxChroma(l, h)) / 0.7),
    tints: key.tints ?? 1,
    hueAt(L) {
      if (c < 0.03) return h;
      if (L >= l) return h + (tint * (L - l)) / Math.max(1e-6, 1 - l);
      return h + shade * Math.min(1, (l - L) / Math.max(1e-6, l - 0.25));
    },
  };
}

function colourAt(path: HuePath, L: number, weight: number): string {
  const h = (path.hueAt(L) + 360) % 360;
  const cmax = maxChroma(L, h);
  return oklchToHex([L, Math.min(cmax, path.saturation * weight * cmax, path.c * 1.1), h]);
}

function solveLuminance(path: HuePath, targetY: number, weight: number, floor?: Floor): string {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(colourAt(path, mid, weight)) < targetY) lo = mid;
    else hi = mid;
  }
  let L = Math.round(((lo + hi) / 2) * 1e4) / 1e4;
  let hex = colourAt(path, L, weight);
  for (let i = 0; floor && i < 400 && !floor.ok(hex); i++) {
    L += (typeof floor.dir === "function" ? floor.dir(hex) : floor.dir) * 0.0005;
    hex = colourAt(path, L, weight);
  }
  return hex;
}

const luminanceFor = (ratio: number, againstY: number, darker: boolean) =>
  darker ? (againstY + 0.05) / ratio - 0.05 : ratio * (againstY + 0.05) - 0.05;

export function canvas(neutral: PaletteKey, theme: Theme): string {
  const { l, chroma } = CANVAS[theme];
  if (l >= 1) return "#ffffff";
  const path = huePath(neutral);
  return oklchToHex([l, path.c * chroma, path.h]);
}

export function solveContrast(
  key: PaletteKey,
  against: string,
  theme: Theme,
  ratio: number,
  weight: number,
): string {
  const darker = theme === "light";
  return solveLuminance(huePath(key), luminanceFor(ratio, luminance(against), darker), weight, {
    ok: (hex) => contrast(hex, against) >= ratio,
    dir: darker ? -1 : 1,
  });
}

function solidLabelKind(key: PaletteKey): "white" | "ink" {
  return key.onSolid ?? (contrast(key.key, "#ffffff") >= 3 ? "white" : "ink");
}

function solveSolid(
  key: PaletteKey,
  path: HuePath,
  bg: string,
  theme: Theme,
  ink: string,
  track: string,
) {
  const bgY = luminance(bg);
  const dark = theme === "dark";
  const kind = solidLabelKind(key);
  const fg = kind === "white" ? "#ffffff" : ink;
  const fgY = luminance(fg);
  const f = SOLID.hoverFactor;
  const k = bgY + 0.05;
  const restVsBg = SOLID.minNonText * SCALE[SOLID.track].ratio[theme];
  let yMin: number;
  let yMax: number;
  if (kind === "white") {
    yMax = (fgY + 0.05) / SOLID.minText - 0.05;
    if (dark) yMin = Math.max(restVsBg * k, f * SOLID.minNonText * k) - 0.05;
    else {
      yMin = 0;
      yMax = Math.min(yMax, k / restVsBg - 0.05);
    }
  } else {
    yMin = Math.max(f * SOLID.minText * (fgY + 0.05), dark ? restVsBg * k : 0) - 0.05;
    yMax = dark ? 1 : k / restVsBg - 0.05;
  }
  if (yMin > yMax) {
    throw new Error(
      `No ${kind}-label solid for ${key.key} in ${theme}: set onSolid or pick another key.`,
    );
  }
  const keyY = luminance(key.key);
  const restY = Math.min(yMax, Math.max(yMin, keyY));
  const labelOk = (hex: string) => contrast(fg, hex) >= 4.5;
  const bgOk = (hex: string) => contrast(bg, hex) >= SOLID.minNonText;
  const floor: Floor = {
    ok: (hex) => labelOk(hex) && bgOk(hex),
    dir: (hex) => (!labelOk(hex) ? (kind === "white" ? -1 : 1) : dark ? 1 : -1),
  };
  const trackOk = (hex: string) => contrast(track, hex) >= 3;
  const restFloor: Floor = {
    ok: (hex) => floor.ok(hex) && trackOk(hex),
    dir: (hex) => (!trackOk(hex) ? (dark ? 1 : -1) : (floor.dir as (h: string) => number)(hex)),
  };
  const rest =
    restY === keyY && trackOk(key.key)
      ? key.key.toLowerCase()
      : solveLuminance(path, restY, 1, restFloor);
  const restLum = luminance(rest);
  const darkerY = (restLum + 0.05) / f - 0.05;
  const hover = solveLuminance(
    path,
    darkerY > 0.002 ? darkerY : (restLum + 0.05) * f - 0.05,
    1,
    floor,
  );
  return { rest, hover, fg };
}

export interface GeneratedPalette {
  steps: Record<Step, string>;
  solid: string;
  solidHover: string;
  solidFg: string;
}

export function generatePalette(
  key: PaletteKey,
  neutral: PaletteKey,
  theme: Theme,
): GeneratedPalette {
  const bg = canvas(neutral, theme);
  const bgY = luminance(bg);
  const darker = theme === "light";
  const path = huePath(key);
  const steps = {} as Record<Step, string>;
  for (const step of STEPS) {
    const ratio = SCALE[step].ratio[theme];
    const { chroma } = SCALE[step];
    const weight = step <= LAST_TINT_STEP ? chroma[theme] * path.tints : chroma[theme];
    steps[step] = solveLuminance(path, luminanceFor(ratio, bgY, darker), weight, {
      ok: (hex) => contrast(hex, bg) >= ratio,
      dir: darker ? -1 : 1,
    });
  }
  const ink = solveLuminance(path, SOLID.inkY, 0.3);
  const solid = solveSolid(key, path, bg, theme, ink, steps[SOLID.track]);
  return { steps, solid: solid.rest, solidHover: solid.hover, solidFg: solid.fg };
}

export function generateText(neutral: PaletteKey, theme: Theme): Record<TextRole, string> {
  const bg = canvas(neutral, theme);
  const path = huePath(neutral);
  const darker = theme === "light";
  const solve = (ratio: number) =>
    solveLuminance(path, luminanceFor(ratio, luminance(bg), darker), TEXT_CHROMA[theme], {
      ok: (hex) => contrast(hex, bg) >= ratio,
      dir: darker ? -1 : 1,
    });
  const text = TEXT[theme];
  return { DEFAULT: solve(text.DEFAULT), muted: solve(text.muted), subtle: solve(text.subtle) };
}
