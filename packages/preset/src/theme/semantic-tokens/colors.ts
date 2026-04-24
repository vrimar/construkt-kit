import { defineSemanticTokens } from "@pandacss/dev";

type TokenValue = { value: { _light: string; _dark: string } };

function tv(light: string, dark: string): TokenValue {
  return { value: { _light: light, _dark: dark } };
}

/**
 * Compound semantic tokens for a color palette.
 */
function colorPalette(color: string) {
  const c = (shade: number) => `{colors.${color}.${shade}}`;

  return {
    solid: {
      bg: {
        DEFAULT: tv(c(600), c(400)),
        hover: tv(c(700), c(300)),
      },
      fg: tv("white", "{colors.slate.950}"),
    },
    contrast: tv("white", "{colors.slate.950}"),
    surface: {
      bg: {
        DEFAULT: tv(c(50), c(800)),
        hover: tv(c(100), c(700)),
        active: tv(c(200), c(600)),
      },
      border: {
        DEFAULT: tv(c(200), c(700)),
        hover: tv(c(300), c(600)),
      },
      fg: tv(c(700), c(200)),
    },
    subtle: {
      bg: {
        DEFAULT: tv(c(100), c(800)),
        hover: tv(c(200), c(700)),
        active: tv(c(300), c(600)),
      },
      fg: tv(c(700), c(200)),
      border: tv(c(200), c(700)),
    },
    outline: {
      border: tv(c(300), c(600)),
      fg: tv(c(700), c(200)),
      bg: {
        hover: tv(c(50), c(800)),
        active: tv(c(100), c(700)),
      },
    },
    plain: {
      fg: tv(c(700), c(200)),
      bg: {
        hover: tv(c(50), c(700)),
        active: tv(c(100), c(600)),
      },
    },
    focusRing: tv(c(500), c(500)),
    fg: tv(c(700), c(300)),
  };
}

const neutral = colorPalette("slate");
neutral.surface.bg.DEFAULT = tv("white", "{colors.slate.800}");

export const colors = defineSemanticTokens.colors({
  // Global background tokens
  bg: {
    DEFAULT: tv("white", "{colors.slate.900}"),
    subtle: tv("{colors.slate.50}", "{colors.slate.800}"),
    muted: tv("{colors.slate.100}", "{colors.slate.700}"),
    emphasized: tv("{colors.slate.200}", "{colors.slate.600}"),
    inverted: tv("{colors.slate.900}", "{colors.slate.50}"),
    control: tv("white", "{colors.slate.700}"),
    hover: tv("{colors.slate.50}", "{colors.slate.600}"),
    success: {
      DEFAULT: tv("{colors.green.50}", "{colors.green.900}"),
      hover: tv("{colors.green.100}", "{colors.green.800}"),
    },
  },
  // Global foreground tokens
  fg: {
    DEFAULT: tv("{colors.slate.900}", "{colors.slate.50}"),
    muted: tv("{colors.slate.600}", "{colors.slate.400}"),
    subtle: tv("{colors.slate.400}", "{colors.slate.500}"),
    inverted: tv("{colors.slate.50}", "black"),
    error: tv("{colors.red.500}", "{colors.red.400}"),
    warning: tv("{colors.orange.600}", "{colors.orange.300}"),
    success: tv("{colors.green.600}", "{colors.green.300}"),
    info: tv("{colors.blue.600}", "{colors.blue.300}"),
  },
  // Global border tokens
  border: {
    DEFAULT: tv("{colors.slate.300}", "{colors.slate.700}"),
    muted: tv("{colors.slate.100}", "{colors.slate.800}"),
    subtle: tv("{colors.slate.50}", "{colors.slate.900}"),
    emphasized: tv("{colors.slate.500}", "{colors.slate.600}"),
    inverted: tv("{colors.slate.800}", "{colors.slate.200}"),
    error: tv("{colors.red.500}", "{colors.red.400}"),
    warning: tv("{colors.orange.500}", "{colors.orange.400}"),
    success: tv("{colors.green.500}", "{colors.green.400}"),
    info: tv("{colors.blue.500}", "{colors.blue.400}"),
  },
  // Status color aliases (general-purpose, usable on any CSS color property)
  error: tv("{colors.red.500}", "{colors.red.400}"),
  warning: tv("{colors.orange.500}", "{colors.orange.400}"),
  success: tv("{colors.green.500}", "{colors.green.400}"),
  info: tv("{colors.blue.500}", "{colors.blue.400}"),
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
