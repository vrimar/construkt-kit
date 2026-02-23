import { createSystem, defaultConfig, defineConfig, mergeConfigs } from "@chakra-ui/react";

import { recipes } from "./recipes/recipes";
import { slotRecipes } from "./recipes/slot-recipes";
import { semanticTokens } from "./semantic-tokens";
import { tokens } from "./tokens";

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "primary",
    },
    "html, body": {
      height: "100%",
      width: "100%",
      "--chakra-z-index-modal": "1700",
    },
    body: {
      overflow: "hidden",
    },
    ".App": {
      height: "100%",
      width: "100%",
    },
    ".is-active": {
      opacity: "1 !important",
      visibility: "visible !important",
      transitionDelay: "0s !important",
    },
    ":focus-visible": {
      outline: "none !important",
    },
  },
  theme: {
    tokens: tokens,
    semanticTokens: semanticTokens,
    recipes: recipes,
    slotRecipes: slotRecipes,
  },
});

export const designSystem = createSystem(mergeConfigs(defaultConfig, config));

export default designSystem;
