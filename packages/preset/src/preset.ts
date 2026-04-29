import { definePreset } from "@pandacss/dev";

import { animationStyles } from "./theme/animation-styles";
import { breakpoints } from "./theme/breakpoints";
import { conditions } from "./theme/conditions";
import { globalCss } from "./theme/global-css";
import { globalFontface } from "./theme/global-fontface";
import { keyframes } from "./theme/keyframes";
import { layerStyles } from "./theme/layer-styles";
import { recipes, slotRecipes } from "./theme/recipes";
import { semanticTokens } from "./theme/semantic-tokens";
import { textStyles } from "./theme/text-styles";
import { tokens } from "./theme/tokens";

const colorPaletteValues = [
  "brand",
  "neutral",
  "slate",
  "gray",
  "blue",
  "red",
  "green",
  "orange",
  "yellow",
];

/**
 * Custom Construkt Kit Panda CSS preset.
 * Provides the full Construkt Kit design system: tokens, semantic tokens, recipes,
 * conditions, keyframes, animations, and global CSS.
 *
 * Use with `@pandacss/preset-base` for CSS utility mappings and patterns.
 */
export const construktKitPreset = definePreset({
  name: "construkt-kit-preset",
  conditions,
  globalFontface,
  theme: {
    breakpoints,
    tokens,
    keyframes,
    animationStyles,
    layerStyles,
    textStyles,
    recipes,
    slotRecipes,
    extend: {
      semanticTokens,
    },
  },
  globalCss,
  staticCss: {
    css: [
      {
        properties: {
          colorPalette: colorPaletteValues,
        },
      },
    ],
  },
});
