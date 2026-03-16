import { definePreset } from "@pandacss/dev";

import { animationStyles } from "./theme/animation-styles";
import { conditions } from "./theme/conditions";
import { globalCss } from "./theme/global-css";
import { keyframes } from "./theme/keyframes";
import { layerStyles } from "./theme/layer-styles";
import { recipes, slotRecipes } from "./theme/recipes";
import { semanticTokens } from "./theme/semantic-tokens";
import { textStyles } from "./theme/text-styles";

/**
 * Custom B3 Panda CSS preset.
 * Provides the full B3 design system: tokens, semantic tokens, recipes,
 * conditions, keyframes, animations, and global CSS.
 *
 * Requires `@pandacss/preset-panda` as a sibling preset for base color scales.
 */
export const b3Preset = definePreset({
  name: "b3-preset",
  conditions,
  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    keyframes,
    animationStyles,
    layerStyles,
    textStyles,
    recipes,
    slotRecipes,
    extend: {
      tokens: {
        colors: {
          brand: {
            50: { value: "#e8f1ff" },
            100: { value: "#c7dbff" },
            200: { value: "#a3c3ff" },
            300: { value: "#7faaff" },
            400: { value: "#5b92ff" },
            500: { value: "#3778ff" },
            600: { value: "#2f67db" },
            700: { value: "#2757b8" },
            800: { value: "#1f4794" },
            900: { value: "#132c5c" },
            950: { value: "#0a1a3a" },
          },
        },
        fonts: {
          body: {
            value:
              '"Inter Variable", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
          },
        },
      },
      semanticTokens,
    },
  },
  globalCss: {
    html: {
      colorPalette: "brand",
      height: "100%",
      width: "100%",
    },
    body: {
      height: "100%",
      width: "100%",
      overflow: "hidden",
      fontFamily: "body",
      ...globalCss.extend.body,
    },
    ".App": {
      height: "100%",
      width: "100%",
    },
    ...Object.fromEntries(
      Object.entries(globalCss.extend).filter(([k]) => k !== "body"),
    ),
  },
});
