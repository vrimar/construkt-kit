import type { SemanticTokens } from "@pandacss/types";

import { contrastFailures } from "../color/contract";
import {
  type GeneratedPalette,
  type PaletteKey,
  type Step,
  type Theme,
  canvas,
  generatePalette,
  generateText,
  solveContrast,
} from "../color/generate";
import { NEUTRAL, PALETTES, STATUS } from "../color/palettes";

export interface ColorOptions {
  /**
   * Palettes to add, or to replace by name (`brand`, `red`, `orange`, `yellow`, `green`, `teal`,
   * `cyan`, `blue`, `purple`, `pink`). Each becomes a `colorPalette` whose every shade is generated
   * from its key colour; codegen fails when a palette cannot meet WCAG AA contrast.
   */
  palettes?: Record<string, PaletteKey>;
  /** The grey that surfaces, borders and text are generated from. Defaults to slate. */
  neutral?: PaletteKey;
}

type Source = Step | "solid" | "solidHover" | "solidFg";

const ROLES: Record<string, Source> = {
  "solid.bg": "solid",
  "solid.bg.hover": "solidHover",
  "solid.fg": "solidFg",
  "surface.bg": 1,
  "surface.bg.hover": 3,
  "surface.bg.active": 4,
  "surface.border": 6,
  "surface.border.hover": 7,
  "surface.fg": 9,
  "subtle.bg": 3,
  "subtle.bg.hover": 4,
  "subtle.bg.active": 5,
  "subtle.border": 6,
  "subtle.fg": 9,
  "outline.border": 7,
  "outline.fg": 9,
  "outline.bg.hover": 2,
  "outline.bg.active": 3,
  "plain.fg": 9,
  "plain.bg.hover": 2,
  "plain.bg.active": 3,
  focusRing: 9,
  fg: 9,
};

const NEUTRAL_TEXT_ROLES = new Set(["surface.fg", "subtle.fg", "outline.fg", "plain.fg", "fg"]);
const NEUTRAL_TEXT_STEP: Step = 10;
const CONTROL_BORDER = 3.05;
const HIGHLIGHT_BG = 1.35;

function roles(name: string, palette: GeneratedPalette, neutral: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [role, source] of Object.entries(ROLES)) {
    const s = neutral && NEUTRAL_TEXT_ROLES.has(role) ? NEUTRAL_TEXT_STEP : source;
    out[`${name}.${role}`] = typeof s === "number" ? palette.steps[s] : palette[s];
  }
  return out;
}

function themeColors(theme: Theme, neutralKey: PaletteKey, keys: Record<string, PaletteKey>) {
  const bg = canvas(neutralKey, theme);
  const neutral = generatePalette(neutralKey, neutralKey, theme);
  const generated = Object.fromEntries(
    Object.entries(keys).map(([name, key]) => [name, generatePalette(key, neutralKey, theme)]),
  );
  const n = neutral.steps;
  const text = generateText(neutralKey, theme);
  const control = theme === "light" ? bg : n[3];
  const status = (name: keyof typeof STATUS) => generated[STATUS[name]];
  const light = theme === "light";

  const colors: Record<string, string> = {
    ...roles("neutral", neutral, true),
    "neutral.surface.bg": light ? bg : n[1],
  };
  for (const [name, palette] of Object.entries(generated))
    Object.assign(colors, roles(name, palette, false));
  for (const name of Object.keys(STATUS) as (keyof typeof STATUS)[]) {
    Object.assign(colors, roles(name, status(name), false), { [name]: status(name).steps[8] });
  }

  return Object.assign(colors, {
    bg,
    "bg.subtle": n[1],
    "bg.muted": n[3],
    "bg.emphasized": n[5],
    "bg.control": control,
    "bg.inverted": text.DEFAULT,
    fg: text.DEFAULT,
    "fg.muted": text.muted,
    "fg.subtle": text.subtle,
    "fg.inverted": bg,
    "fg.error": status("danger").steps[9],
    "fg.warning": status("warning").steps[9],
    "fg.success": status("success").steps[9],
    "fg.info": status("info").steps[9],
    border: n[6],
    "border.subtle": n[1],
    "border.muted": n[3],
    "border.emphasized": n[8],
    "border.control": solveContrast(neutralKey, control, theme, CONTROL_BORDER, 0.9),
    "border.inverted": n[10],
    "border.error": status("danger").steps[8],
    "border.warning": status("warning").steps[8],
    "border.success": status("success").steps[8],
    "border.info": status("info").steps[8],
    "highlight.bg": light
      ? solveContrast(keys.yellow, bg, theme, HIGHLIGHT_BG, 1)
      : generated.yellow.solid,
    "highlight.fg": light ? text.DEFAULT : generated.yellow.solidFg,
  });
}

function nest(colors: Record<Theme, Record<string, string>>) {
  const tree: Record<string, Record<string, unknown>> = {};
  for (const path of Object.keys(colors.light)) {
    let node = tree as Record<string, unknown>;
    for (const segment of path.split(".")) node = (node[segment] ??= {}) as Record<string, unknown>;
    node.DEFAULT = { value: { _light: colors.light[path], _dark: colors.dark[path] } };
  }
  return tree;
}

export function createSemanticColors({
  palettes,
  neutral = NEUTRAL,
}: ColorOptions = {}): SemanticTokens["colors"] {
  const reserved = ["neutral", ...Object.keys(STATUS)].filter(
    (name) => palettes && name in palettes,
  );
  if (reserved.length > 0) {
    throw new Error(
      `${reserved.join(", ")} cannot be set through palettes: use the neutral option, or replace the palette a status maps to (${Object.entries(
        STATUS,
      )
        .map(([status, base]) => `${status} → ${base}`)
        .join(", ")}).`,
    );
  }
  const keys = { ...PALETTES, ...palettes };
  const colors = {
    light: themeColors("light", neutral, keys),
    dark: themeColors("dark", neutral, keys),
  };
  const failures = contrastFailures(colors, [
    "neutral",
    ...Object.keys(keys),
    ...Object.keys(STATUS),
  ]);
  if (failures.length > 0) {
    throw new Error(`Colour palettes fail WCAG AA contrast:\n${failures.join("\n")}`);
  }
  return nest(colors) as SemanticTokens["colors"];
}
