import { definePreset } from "@pandacss/dev";
import type { Preset } from "@pandacss/types";

import { animationStyles } from "./theme/animation-styles";
import { breakpoints } from "./theme/breakpoints";
import { conditions } from "./theme/conditions";
import { globalCss } from "./theme/global-css";
import { globalFontface } from "./theme/global-fontface";
import { keyframes } from "./theme/keyframes";
import { layerStyles } from "./theme/layer-styles";
import { recipes, slotRecipes } from "./theme/recipes";
import { createSemanticTokens } from "./theme/semantic-tokens";
import type { ColorOptions } from "./theme/semantic-tokens/colors";
import { textStyles } from "./theme/text-styles";
import { tokens } from "./theme/tokens";

export type ConstruktKitPresetOptions = ColorOptions;

/**
 * Builds the Construkt Kit Panda CSS preset: tokens, generated semantic colours, recipes,
 * conditions, keyframes, animations, and global CSS.
 *
 * Use with `@pandacss/preset-base` for CSS utility mappings and patterns.
 */
export function createConstruktKitPreset(options: ConstruktKitPresetOptions = {}): Preset {
  const semanticTokens = createSemanticTokens(options);
  const colorPaletteValues = Object.entries(semanticTokens.colors ?? {})
    .filter(([, value]) => typeof value === "object" && value !== null && "solid" in value)
    .map(([name]) => name);

  return definePreset({
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
}

/** The Construkt Kit preset with the default palettes. */
export const construktKitPreset: Preset = createConstruktKitPreset();
