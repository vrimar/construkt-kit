import { type Preset, definePreset } from "@pandacss/dev";

import { dataGrid } from "./recipe";

/**
 * Panda preset carrying the `dataGrid` slot recipe. Import it and add it next to the app's
 * `designSystem`: `presets: [dataGridPreset]`. An app that sets its own `staticCss` must list
 * `dataGrid` in it.
 */
export const dataGridPreset: Preset = definePreset({
  name: "@construkt-kit/data-grid",
  theme: {
    extend: {
      slotRecipes: { dataGrid },
      keyframes: {
        "data-grid-flash": { from: { opacity: "1" }, to: { opacity: "0" } },
      },
    },
  },
});
