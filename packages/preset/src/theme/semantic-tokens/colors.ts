import { defineSemanticTokens } from "@pandacss/dev";

type TokenValue = { value: { _light: string; _dark: string } };

function tv(light: string, dark: string): TokenValue {
  return { value: { _light: light, _dark: dark } };
}

// Light shade per palette role — Tailwind 50–950 numbering, shared by every palette.
const LIGHT = {
  solidBg: 600,
  solidBgHover: 700,
  surfaceBg: 50,
  surfaceBgHover: 100,
  surfaceBgActive: 200,
  surfaceBorder: 200,
  surfaceBorderHover: 300,
  surfaceFg: 700,
  subtleBg: 100,
  subtleBgHover: 200,
  subtleBgActive: 300,
  subtleFg: 700,
  subtleBorder: 200,
  outlineBorder: 300,
  outlineFg: 700,
  outlineBgHover: 50,
  outlineBgActive: 100,
  plainFg: 700,
  plainBgHover: 50,
  plainBgActive: 100,
  focusRing: 500,
  fg: 700,
} as const;

type Role = keyof typeof LIGHT;
type DarkSteps = Record<Role, number>;

// Dark shade per role for accent palettes — Tailwind numbering (default).
const TAILWIND_DARK: DarkSteps = {
  solidBg: 400,
  solidBgHover: 300,
  surfaceBg: 800,
  surfaceBgHover: 700,
  surfaceBgActive: 600,
  surfaceBorder: 700,
  surfaceBorderHover: 600,
  surfaceFg: 200,
  subtleBg: 800,
  subtleBgHover: 700,
  subtleBgActive: 600,
  subtleFg: 200,
  subtleBorder: 700,
  outlineBorder: 600,
  outlineFg: 200,
  outlineBgHover: 800,
  outlineBgActive: 700,
  plainFg: 200,
  plainBgHover: 700,
  plainBgActive: 600,
  focusRing: 500,
  fg: 300,
};

// Dark shade per role for the neutral chrome — Radix "slateDark" 1–12 (1–2 bg, 3–5 component, 6–8 border, 9–10 solid, 11–12 text).
const RADIX_DARK: DarkSteps = {
  solidBg: 9,
  solidBgHover: 10,
  surfaceBg: 3,
  surfaceBgHover: 4,
  surfaceBgActive: 5,
  surfaceBorder: 6,
  surfaceBorderHover: 7,
  surfaceFg: 11,
  subtleBg: 3,
  subtleBgHover: 4,
  subtleBgActive: 5,
  subtleFg: 11,
  subtleBorder: 6,
  // Step 8 (not 7) so resting control outlines clear WCAG 3:1 on the app bg; decorative borders stay at 6.
  outlineBorder: 8,
  outlineFg: 11,
  outlineBgHover: 3,
  outlineBgActive: 4,
  plainFg: 11,
  plainBgHover: 3,
  plainBgActive: 4,
  focusRing: 8,
  fg: 11,
};

/**
 * Compound semantic tokens for a color palette. Light and dark are sourced
 * independently: light always uses the Tailwind ramp; dark uses `darkSteps`
 * against the `dark` ramp (defaults reproduce the original Tailwind dark).
 */
function colorPalette(light: string, dark: string = light, darkSteps: DarkSteps = TAILWIND_DARK) {
  const p = (role: Role) =>
    tv(`{colors.${light}.${LIGHT[role]}}`, `{colors.${dark}.${darkSteps[role]}}`);

  return {
    solid: {
      bg: {
        DEFAULT: p("solidBg"),
        hover: p("solidBgHover"),
      },
      fg: tv("white", "{colors.slate.950}"),
    },
    contrast: tv("white", "{colors.slate.950}"),
    surface: {
      bg: {
        DEFAULT: p("surfaceBg"),
        hover: p("surfaceBgHover"),
        active: p("surfaceBgActive"),
      },
      border: {
        DEFAULT: p("surfaceBorder"),
        hover: p("surfaceBorderHover"),
      },
      fg: p("surfaceFg"),
    },
    subtle: {
      bg: {
        DEFAULT: p("subtleBg"),
        hover: p("subtleBgHover"),
        active: p("subtleBgActive"),
      },
      fg: p("subtleFg"),
      border: p("subtleBorder"),
    },
    outline: {
      border: p("outlineBorder"),
      fg: p("outlineFg"),
      bg: {
        hover: p("outlineBgHover"),
        active: p("outlineBgActive"),
      },
    },
    plain: {
      fg: p("plainFg"),
      bg: {
        hover: p("plainBgHover"),
        active: p("plainBgActive"),
      },
    },
    focusRing: p("focusRing"),
    fg: p("fg"),
  };
}

/**
 * Status/action palette: a full color palette plus a flat DEFAULT so the name
 * resolves both as a bare color (`color: "success"`) and as a `colorPalette`
 * (`colorPalette="success"`, used by recipes like button/badge).
 */
function statusPalette(color: string) {
  return { DEFAULT: tv(`{colors.${color}.500}`, `{colors.${color}.400}`), ...colorPalette(color) };
}

// Neutral chrome uses the Radix "slateDark" ramp on the dark side; light stays Tailwind slate.
const neutral = colorPalette("slate", "slateDark", RADIX_DARK);
neutral.surface.bg.DEFAULT = tv("white", "{colors.slateDark.2}");
// Neutral solid.bg is a mid-gray, not a bright accent, so its label needs white text for AA contrast.
neutral.solid.fg = tv("white", "white");
neutral.contrast = tv("white", "white");

export const colors = defineSemanticTokens.colors({
  // Global background tokens (dark → Radix slateDark: 1 app, 2 subtle, 3 muted, 4 control/hover, 5 emphasized)
  bg: {
    DEFAULT: tv("white", "{colors.slateDark.1}"),
    subtle: tv("{colors.slate.50}", "{colors.slateDark.2}"),
    muted: tv("{colors.slate.100}", "{colors.slateDark.3}"),
    emphasized: tv("{colors.slate.200}", "{colors.slateDark.5}"),
    inverted: tv("{colors.slate.900}", "{colors.slate.50}"),
    control: tv("white", "{colors.slateDark.4}"),
    hover: tv("{colors.slate.50}", "{colors.slateDark.4}"),
    success: {
      DEFAULT: tv("{colors.green.50}", "{colors.green.900}"),
      hover: tv("{colors.green.100}", "{colors.green.800}"),
    },
  },
  // Global foreground tokens (dark → Radix slateDark: 12 text, 11 muted, 10 subtle)
  fg: {
    DEFAULT: tv("{colors.slate.900}", "{colors.slateDark.12}"),
    muted: tv("{colors.slate.600}", "{colors.slateDark.11}"),
    subtle: tv("{colors.slate.400}", "{colors.slateDark.10}"),
    inverted: tv("{colors.slate.50}", "black"),
    error: tv("{colors.red.500}", "{colors.red.400}"),
    warning: tv("{colors.orange.600}", "{colors.orange.300}"),
    success: tv("{colors.green.600}", "{colors.green.300}"),
    info: tv("{colors.blue.600}", "{colors.blue.300}"),
  },
  // Global border tokens (dark → Radix slateDark: 3 subtle, 4 muted, 6 default, 8 emphasized)
  border: {
    DEFAULT: tv("{colors.slate.300}", "{colors.slateDark.6}"),
    muted: tv("{colors.slate.100}", "{colors.slateDark.4}"),
    subtle: tv("{colors.slate.50}", "{colors.slateDark.3}"),
    emphasized: tv("{colors.slate.500}", "{colors.slateDark.8}"),
    inverted: tv("{colors.slate.800}", "{colors.slate.200}"),
    error: tv("{colors.red.500}", "{colors.red.400}"),
    warning: tv("{colors.orange.500}", "{colors.orange.400}"),
    success: tv("{colors.green.500}", "{colors.green.400}"),
    info: tv("{colors.blue.500}", "{colors.blue.400}"),
  },
  // Search/text-match highlight — dark-text-on-amber in both modes for legibility.
  highlight: {
    bg: tv("{colors.yellow.200}", "{colors.yellow.400}"),
    fg: tv("{colors.slate.900}", "{colors.slate.950}"),
  },
  // Status/action color aliases — full palettes usable both as a bare color
  // (`color: "success"`) and as a `colorPalette` (`colorPalette="danger"`).
  error: statusPalette("red"),
  warning: statusPalette("orange"),
  success: statusPalette("green"),
  info: statusPalette("blue"),
  danger: statusPalette("red"),
  /**
   * Neutral palette — the default "chrome" color for controls, surfaces, and
   * containers.  Recipes reference `neutral.*` so the neutral hue can be
   * swapped in a single place (e.g. change `"gray"` to `"slate"`).
   */
  neutral,
  brand: colorPalette("brand"),
  red: colorPalette("red"),
  green: colorPalette("green"),
  orange: colorPalette("orange"),
  blue: colorPalette("blue"),
});
