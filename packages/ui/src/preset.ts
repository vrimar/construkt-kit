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
 * Custom B3 Panda CSS preset.
 * Provides the full B3 design system: tokens, semantic tokens, recipes,
 * conditions, keyframes, animations, and global CSS.
 *
 * Use with `@pandacss/preset-base` for CSS utility mappings and patterns.
 */
export const b3Preset = definePreset({
  name: "b3-preset",
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
    recipes: {
      menu: [{ size: ["xs", "sm", "md", "lg", "xl"] }],
      listbox: [{ size: ["sm", "md", "lg"] }],
      accordion: [{ size: ["sm", "md"] }],
      breadcrumb: [{ size: ["xs", "sm", "md", "lg"] }],
      checkboxCard: [{ size: ["sm", "md", "lg"] }],
      combobox: [{ size: ["xs", "sm", "md", "lg", "xl"] }],
      editable: [{ size: ["2xs", "xs", "sm", "md", "lg"] }],
      emptyState: [{ size: ["sm", "md", "lg"] }],
      icon: [{ size: ["2xs", "xs", "sm", "md", "lg", "xl"] }],
      numberInput: [{ size: ["sm", "md", "lg", "xl"] }],
      pinInput: [{ size: ["xs", "sm", "md", "lg", "xl", "2xl"] }],
      progress: [{ size: ["xs", "sm", "md", "lg", "xl"] }],
      scrollArea: [{ size: ["xs", "sm", "md", "lg"] }],
      stat: [{ size: ["sm", "md", "lg"] }],
      tagsInput: [{ size: ["xs", "sm", "md", "lg", "xl"] }],
      treeView: [{ size: ["sm", "md"] }],
    },
  },
});
