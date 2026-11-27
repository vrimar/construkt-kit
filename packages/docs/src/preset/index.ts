import { type Preset, definePreset } from "@pandacss/dev";

import { proseGlobalCss } from "./prose";
import {
  docsAnchor,
  docsArticle,
  docsNav,
  docsPager,
  docsSearch,
  docsShell,
  docsToc,
} from "./recipe";

/**
 * Panda preset carrying the docs slot recipes and the prose rules for `[data-docs-prose]`.
 * Import it and add it next to the site's `designSystem`: `presets: [docsPreset]`. A site
 * that sets its own `staticCss` must list the `docs*` recipes in it.
 */
export const docsPreset: Preset = definePreset({
  name: "@construkt-kit/docs",
  globalCss: { extend: proseGlobalCss },
  theme: {
    extend: {
      slotRecipes: { docsAnchor, docsArticle, docsNav, docsPager, docsSearch, docsShell, docsToc },
    },
  },
});
