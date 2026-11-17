import type { Theme } from "./generate";
import { contrast } from "./oklch";

const TEXT_MIN = 4.5;
const NON_TEXT_MIN = 3;
// Below WCAG 1.4.11's 3:1 on purpose: input edges trade contrast for a lighter look.
const CONTROL_EDGE_MIN = 2.2;

type Pair = [fg: string, bg: string, min: number];

function palettePairs(p: string): Pair[] {
  const text = (fg: string, ...bgs: string[]) => bgs.map((bg): Pair => [fg, bg, TEXT_MIN]);
  const nonText = (fg: string, ...bgs: string[]) => bgs.map((bg): Pair => [fg, bg, NON_TEXT_MIN]);
  return [
    ...text(`${p}.solid.fg`, `${p}.solid.bg`, `${p}.solid.bg.hover`),
    ...text(`${p}.subtle.fg`, `${p}.subtle.bg`, `${p}.subtle.bg.hover`, `${p}.subtle.bg.active`),
    ...text(
      `${p}.surface.fg`,
      `${p}.surface.bg`,
      `${p}.surface.bg.hover`,
      `${p}.surface.bg.active`,
    ),
    ...text(`${p}.outline.fg`, "bg", `${p}.outline.bg.hover`, `${p}.outline.bg.active`),
    ...text(`${p}.plain.fg`, "bg", `${p}.plain.bg.hover`, `${p}.plain.bg.active`),
    ...text(`${p}.fg`, "bg", "bg.muted"),
    ...text("fg", `${p}.subtle.bg.active`, `${p}.surface.bg.active`),
    ...text("fg.muted", `${p}.subtle.bg.active`, `${p}.surface.bg.active`),
    ...nonText(`${p}.solid.bg`, "bg", `${p}.subtle.bg`),
    ...nonText(`${p}.solid.bg.hover`, "bg"),
    ...nonText(`${p}.control`, "bg", `${p}.subtle.bg`, "neutral.subtle.bg"),
    ...nonText(`${p}.focusRing`, "bg", "bg.emphasized", `${p}.subtle.bg.active`),
  ];
}

const SURFACES = [
  "bg",
  "bg.subtle",
  "bg.muted",
  "bg.control",
  "neutral.surface.bg",
  "neutral.surface.bg.hover",
];

const GLOBAL_PAIRS: Pair[] = [
  ...["fg", "fg.muted"].flatMap((fg) =>
    [...SURFACES, "bg.emphasized", "neutral.surface.bg.active"].map((bg): Pair => [
      fg,
      bg,
      TEXT_MIN,
    ]),
  ),
  ...SURFACES.map((bg): Pair => ["fg.subtle", bg, TEXT_MIN]),
  ...["fg.error", "fg.warning", "fg.success", "fg.info"].flatMap((fg) =>
    ["bg", "bg.subtle", "bg.muted", "neutral.surface.bg"].map((bg): Pair => [fg, bg, TEXT_MIN]),
  ),
  ["fg.inverted", "bg.inverted", TEXT_MIN],
  ["highlight.fg", "highlight.bg", TEXT_MIN],
  ["border.control", "bg", CONTROL_EDGE_MIN],
  ["border.control", "bg.control", CONTROL_EDGE_MIN],
  ...["border.error", "border.warning", "border.success", "border.info"].map((b): Pair => [
    b,
    "bg",
    NON_TEXT_MIN,
  ]),
  ...["danger", "warning", "success", "info"].flatMap((s) =>
    ["bg", "neutral.surface.bg"].map((bg): Pair => [s, bg, NON_TEXT_MIN]),
  ),
];

export function contrastFailures(
  colors: Record<Theme, Record<string, string>>,
  palettes: string[],
): string[] {
  const pairs = [...GLOBAL_PAIRS, ...palettes.flatMap(palettePairs)];
  const failures: string[] = [];
  for (const theme of Object.keys(colors) as Theme[]) {
    const c = colors[theme];
    for (const [fg, bg, min] of pairs) {
      if (!(fg in c) || !(bg in c))
        throw new Error(`Contrast contract names an unknown colour: ${fg} or ${bg}`);
      const ratio = contrast(c[fg], c[bg]);
      if (ratio < min)
        failures.push(`${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
    }
  }
  return failures;
}
