import { definePreset } from "@pandacss/dev";
import type { Preset } from "@pandacss/types";

import { animationStyles } from "./theme/animation-styles";
import { breakpoints } from "./theme/breakpoints";
import { conditions } from "./theme/conditions";
import { globalCss } from "./theme/global-css";
import { globalFontface } from "./theme/global-fontface";
import { keyframes } from "./theme/keyframes";
import { layerStyles, surfaceGlobalVars } from "./theme/layer-styles";
import { recipes, slotRecipes } from "./theme/recipes";
import { carouselGlobalVars } from "./theme/recipes/carousel";
import { collapsibleGlobalVars } from "./theme/recipes/collapsible";
import { colorPickerGlobalVars } from "./theme/recipes/color-picker";
import { controlGlobalVars } from "./theme/recipes/control-size";
import { fieldGlobalVars } from "./theme/recipes/field";
import { floatingGlobalVars } from "./theme/recipes/floating";
import { indicatorGlobalVars } from "./theme/recipes/indicator";
import { listboxGlobalVars } from "./theme/recipes/listbox";
import { modalGlobalVars } from "./theme/recipes/modal";
import { progressGlobalVars } from "./theme/recipes/progress";
import { scrollAreaGlobalVars } from "./theme/recipes/scroll-area";
import { sortableGlobalVars } from "./theme/recipes/sortable";
import { tableGlobalVars } from "./theme/recipes/table";
import { toastGlobalVars } from "./theme/recipes/toast";
import { treeViewGlobalVars } from "./theme/recipes/tree-view";
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
  const { semanticTokens, paletteNames } = createSemanticTokens(options);

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
    globalVars: {
      ...scrollAreaGlobalVars,
      ...carouselGlobalVars,
      ...collapsibleGlobalVars,
      ...colorPickerGlobalVars,
      ...controlGlobalVars,
      ...fieldGlobalVars,
      ...floatingGlobalVars,
      ...indicatorGlobalVars,
      ...listboxGlobalVars,
      ...modalGlobalVars,
      ...progressGlobalVars,
      ...treeViewGlobalVars,
      ...surfaceGlobalVars,
      ...toastGlobalVars,
      ...sortableGlobalVars,
      ...tableGlobalVars,
    },
    staticCss: {
      css: [
        {
          properties: {
            colorPalette: paletteNames,
          },
        },
      ],
    },
  });
}

/** The Construkt Kit preset with the default palettes. */
export const construktKitPreset: Preset = createConstruktKitPreset();
